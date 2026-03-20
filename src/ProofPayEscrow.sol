// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProofPayEscrow
 * @dev A production-quality freelancer escrow system with client-freelancer workflow.
 *      Supports partial payment releases, on-chain timestamps, 48-hour auto-release,
 *      and on-chain trust scores.
 */
contract ProofPayEscrow is ReentrancyGuard {

    enum Status {
        PENDING,
        ACCEPTED,
        PROOF_SUBMITTED,
        COMPLETED,
        CANCELLED
    }

    struct Job {
        address client;
        address freelancer;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 createdAt;
        uint256 acceptedAt;
        uint256 proofSubmittedAt;
        Status status;
        string jobTitle;
        string proofHash;
    }

    // State variables
    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;

    // Trust score tracking
    mapping(address => uint256) public completedJobs;
    mapping(address => uint256) public successfulPayments;

    // Events
    event JobCreated(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 payment);
    event JobAccepted(uint256 indexed jobId);
    event ProofSubmitted(uint256 indexed jobId, string proofHash);
    event PaymentReleased(uint256 indexed jobId, uint256 amount);
    event JobCompleted(uint256 indexed jobId);
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
    error ProofNotSubmitted();
    error InsufficientEscrow();
    error AutoReleaseNotReady();
    error JobNotCancellable();

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
     * @param jobTitle A short title describing the job.
     * @return jobId The ID of the newly created job.
     */
    function createJob(address freelancer, string calldata jobTitle) external payable returns (uint256) {
        if (freelancer == address(0)) revert InvalidFreelancer();
        if (msg.value == 0) revert NoPaymentProvided();

        uint256 jobId = jobCount++;
        jobs[jobId] = Job({
            client: msg.sender,
            freelancer: freelancer,
            totalAmount: msg.value,
            releasedAmount: 0,
            createdAt: block.timestamp,
            acceptedAt: 0,
            proofSubmittedAt: 0,
            status: Status.PENDING,
            jobTitle: jobTitle,
            proofHash: ""
        });

        emit JobCreated(jobId, msg.sender, freelancer, msg.value);
        return jobId;
    }

    /**
     * @notice Freelancer accepts the job.
     * @param jobId The ID of the job to accept.
     */
    function acceptJob(uint256 jobId) external jobExists(jobId) onlyFreelancer(jobId) {
        if (jobs[jobId].status != Status.PENDING) revert JobAlreadyAccepted();

        jobs[jobId].status = Status.ACCEPTED;
        jobs[jobId].acceptedAt = block.timestamp;
        emit JobAccepted(jobId);
    }

    /**
     * @notice Freelancer submits proof of work (IPFS hash).
     *         Can only be submitted once — prevents re-submission while client is reviewing.
     * @param jobId The ID of the job.
     * @param ipfsHash The IPFS hash representing the work proof.
     */
    function submitProof(uint256 jobId, string calldata ipfsHash)
        external
        jobExists(jobId)
        onlyFreelancer(jobId)
    {
        if (jobs[jobId].status != Status.ACCEPTED) revert JobNotAccepted();
        if (bytes(ipfsHash).length == 0) revert EmptyProofHash();

        jobs[jobId].proofHash = ipfsHash;
        jobs[jobId].proofSubmittedAt = block.timestamp;
        jobs[jobId].status = Status.PROOF_SUBMITTED;
        emit ProofSubmitted(jobId, ipfsHash);
    }

    /**
     * @notice Client releases a partial or full payment to the freelancer.
     *         Requires proof to have been submitted first.
     * @param jobId The ID of the job.
     * @param amount The amount to release (in wei). Cannot exceed remaining escrow.
     */
    function releasePayment(uint256 jobId, uint256 amount)
        external
        nonReentrant
        jobExists(jobId)
        onlyClient(jobId)
    {
        Job storage job = jobs[jobId];
        if (job.status != Status.PROOF_SUBMITTED) revert ProofNotSubmitted();
        if (amount == 0) revert NoPaymentProvided();
        if (job.releasedAmount + amount > job.totalAmount) revert InsufficientEscrow();

        job.releasedAmount += amount;
        (bool success, ) = job.freelancer.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit PaymentReleased(jobId, amount);

        if (job.releasedAmount == job.totalAmount) {
            job.status = Status.COMPLETED;
            completedJobs[job.freelancer]++;
            successfulPayments[job.client]++;
            emit JobCompleted(jobId);
        }
    }

    /**
     * @notice Client approves all remaining work and releases full remaining payment.
     *         Backward-compatible wrapper around releasePayment.
     * @param jobId The ID of the job to approve.
     */
    function approveWork(uint256 jobId)
        external
        nonReentrant
        jobExists(jobId)
        onlyClient(jobId)
    {
        Job storage job = jobs[jobId];
        if (job.status != Status.PROOF_SUBMITTED) revert ProofNotSubmitted();

        uint256 remaining = job.totalAmount - job.releasedAmount;
        if (remaining == 0) revert JobAlreadyCompleted();

        job.releasedAmount = job.totalAmount;
        (bool success, ) = job.freelancer.call{value: remaining}("");
        if (!success) revert TransferFailed();

        job.status = Status.COMPLETED;
        completedJobs[job.freelancer]++;
        successfulPayments[job.client]++;

        emit PaymentReleased(jobId, remaining);
        emit WorkApproved(jobId);
        emit JobCompleted(jobId);
    }

    /**
     * @notice Freelancer claims full remaining payment if client is inactive for 48 hours
     *         after proof submission.
     * @param jobId The ID of the job.
     */
    function claimPaymentIfClientInactive(uint256 jobId)
        external
        nonReentrant
        jobExists(jobId)
        onlyFreelancer(jobId)
    {
        Job storage job = jobs[jobId];
        if (job.status != Status.PROOF_SUBMITTED) revert ProofNotSubmitted();
        if (block.timestamp < job.proofSubmittedAt + 48 hours) revert AutoReleaseNotReady();

        uint256 remaining = job.totalAmount - job.releasedAmount;
        job.releasedAmount = job.totalAmount;
        (bool success, ) = job.freelancer.call{value: remaining}("");
        if (!success) revert TransferFailed();

        job.status = Status.COMPLETED;
        completedJobs[job.freelancer]++;
        successfulPayments[job.client]++;

        emit PaymentReleased(jobId, remaining);
        emit JobCompleted(jobId);
    }

    /**
     * @notice Client cancels the job and receives a full refund.
     *         Can only be cancelled while the job is still PENDING (before freelancer accepts).
     * @param jobId The ID of the job to cancel.
     */
    function cancelJob(uint256 jobId)
        external
        nonReentrant
        jobExists(jobId)
        onlyClient(jobId)
    {
        Job storage job = jobs[jobId];
        if (job.status != Status.PENDING) revert JobNotCancellable();

        uint256 refund = job.totalAmount;
        job.status = Status.CANCELLED;
        job.totalAmount = 0;

        (bool success, ) = job.client.call{value: refund}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Allows depositing additional payment to an existing job.
     * @param jobId The ID of the job.
     */
    function depositEscrowPayment(uint256 jobId) external payable jobExists(jobId) onlyClient(jobId) {
        if (msg.value == 0) revert NoPaymentProvided();
        Job storage job = jobs[jobId];
        if (job.status == Status.COMPLETED || job.status == Status.CANCELLED) revert JobAlreadyCompleted();

        job.totalAmount += msg.value;
    }

    /**
     * @notice Returns the trust score for a given user.
     *         Score = (completedJobs * 2) + successfulPayments
     * @param user The address to query.
     */
    function getTrustScore(address user) external view returns (uint256) {
        return (completedJobs[user] * 2) + successfulPayments[user];
    }
}
