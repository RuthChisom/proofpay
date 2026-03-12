// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProofPayEscrow
 * @dev A production-quality freelancer escrow system with client-freelancer workflow.
 */
contract ProofPayEscrow is ReentrancyGuard {
    
    struct Job {
        address client;
        address freelancer;
        uint256 payment;
        string proofHash;
        bool accepted;
        bool completed;
    }

    // State variables
    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;

    // Events
    event JobCreated(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 payment);
    event JobAccepted(uint256 indexed jobId);
    event ProofSubmitted(uint256 indexed jobId, string proofHash);
    event WorkApproved(uint256 indexed jobId);

    // Custom Errors
    error NotClient();
    error NotFreelancer();
    error JobAlreadyAccepted();
    error JobNotAccepted();
    error JobAlreadyCompleted();
    error JobDoesNotExist();
    error InvalidFreelancer();
    error EmptyProofHash();
    error NoPaymentProvided();
    error TransferFailed();

    // Modifiers
    modifier onlyClient(uint256 jobId) {
        if (msg.sender != jobs[jobId].client) revert NotClient();
        _;
    }

    modifier onlyFreelancer(uint256 jobId) {
        if (msg.sender != jobs[jobId].freelancer) revert NotFreelancer();
        _;
    }

    modifier jobExists(uint256 jobId) {
        if (jobId >= jobCount) revert JobDoesNotExist();
        _;
    }

    /**
     * @notice Creates a new job and deposits escrow payment.
     * @param freelancer The address of the freelancer assigned to the job.
     * @return jobId The ID of the newly created job.
     */
    function createJob(address freelancer) external payable returns (uint256) {
        if (freelancer == address(0)) revert InvalidFreelancer();
        if (msg.value == 0) revert NoPaymentProvided();

        uint256 jobId = jobCount++;
        jobs[jobId] = Job({
            client: msg.sender,
            freelancer: freelancer,
            payment: msg.value,
            proofHash: "",
            accepted: false,
            completed: false
        });

        emit JobCreated(jobId, msg.sender, freelancer, msg.value);
        return jobId;
    }

    /**
     * @notice Freelancer accepts the job.
     * @param jobId The ID of the job to accept.
     */
    function acceptJob(uint256 jobId) external jobExists(jobId) onlyFreelancer(jobId) {
        if (jobs[jobId].accepted) revert JobAlreadyAccepted();
        
        jobs[jobId].accepted = true;
        emit JobAccepted(jobId);
    }

    /**
     * @notice Freelancer submits proof of work (IPFS hash).
     * @param jobId The ID of the job.
     * @param ipfsHash The IPFS hash representing the work proof.
     */
    function submitProof(uint256 jobId, string calldata ipfsHash) 
        external 
        jobExists(jobId) 
        onlyFreelancer(jobId) 
    {
        if (!jobs[jobId].accepted) revert JobNotAccepted();
        if (jobs[jobId].completed) revert JobAlreadyCompleted();
        if (bytes(ipfsHash).length == 0) revert EmptyProofHash();

        jobs[jobId].proofHash = ipfsHash;
        emit ProofSubmitted(jobId, ipfsHash);
    }

    /**
     * @notice Client approves work and releases payment to the freelancer.
     * @param jobId The ID of the job to approve.
     */
    function approveWork(uint256 jobId) 
        external 
        jobExists(jobId) 
        onlyClient(jobId) 
        nonReentrant 
    {
        if (jobs[jobId].completed) revert JobAlreadyCompleted();
        
        Job storage job = jobs[jobId];
        job.completed = true;
        
        uint256 amount = job.payment;
        (bool success, ) = job.freelancer.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit WorkApproved(jobId);
    }

    /**
     * @notice Allows depositing additional payment to an existing job.
     * @param jobId The ID of the job.
     */
    function depositEscrowPayment(uint256 jobId) external payable jobExists(jobId) onlyClient(jobId) {
        if (msg.value == 0) revert NoPaymentProvided();
        if (jobs[jobId].completed) revert JobAlreadyCompleted();
        
        jobs[jobId].payment += msg.value;
    }
}
