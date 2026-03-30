// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProofPayEscrow
 * @dev Freelancer escrow system with gradual payment release, 48-hour auto-claim,
 *      on-chain trust scores, and full status-driven workflow.
 */
contract ProofPayEscrow is ReentrancyGuard {

    // -------------------------------------------------------------------------
    // Types
    // -------------------------------------------------------------------------

    enum Status { OPEN, ACCEPTED, PROOF_SUBMITTED, COMPLETED }

    struct Job {
        address client;
        address freelancer;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 createdAt;
        uint256 acceptedAt;
        uint256 proofSubmittedAt;
        Status status;
        string proofHash;
        string jobTitle;
    }

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;

    // Trust score tracking
    mapping(address => uint256) public completedJobs;
    mapping(address => uint256) public successfulPayments;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event JobCreated(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 totalAmount);
    event JobAccepted(uint256 indexed jobId);
    event ProofSubmitted(uint256 indexed jobId);
    event PaymentReleased(uint256 indexed jobId, uint256 amount);
    event JobCompleted(uint256 indexed jobId);

    // -------------------------------------------------------------------------
    // Custom Errors
    // -------------------------------------------------------------------------

    error NotClient();
    error NotFreelancer();
    error JobDoesNotExist();
    error InvalidFreelancer();
    error EmptyProofHash();
    error NoPaymentProvided();
    error TransferFailed();
    error JobNotOpen();
    error JobNotAccepted();
    error ProofNotSubmitted();
    error ProofAlreadySubmitted();
    error JobAlreadyCompleted();
    error AmountExceedsEscrow();
    error TooEarlyForClaim();
    error EmptyJobTitle();

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // External Functions
    // -------------------------------------------------------------------------

    /**
     * @notice Creates a new job and locks escrow funds on-chain.
     * @param freelancer The address of the freelancer assigned to the job.
     * @param jobTitle   A short title describing the job.
     * @return jobId     The ID of the newly created job.
     */
    function createJob(address freelancer, string calldata jobTitle) external payable returns (uint256) {
        if (freelancer == address(0)) revert InvalidFreelancer();
        if (msg.value == 0) revert NoPaymentProvided();
        if (bytes(jobTitle).length == 0) revert EmptyJobTitle();

        uint256 jobId = jobCount++;
        jobs[jobId] = Job({
            client: msg.sender,
            freelancer: freelancer,
            totalAmount: msg.value,
            releasedAmount: 0,
            createdAt: block.timestamp,
            acceptedAt: 0,
            proofSubmittedAt: 0,
            status: Status.OPEN,
            proofHash: "",
            jobTitle: jobTitle
        });

        emit JobCreated(jobId, msg.sender, freelancer, msg.value);
        return jobId;
    }

    /**
     * @notice Freelancer accepts the job. Only possible while status is OPEN.
     * @param jobId The ID of the job to accept.
     */
    function acceptJob(uint256 jobId) external jobExists(jobId) onlyFreelancer(jobId) {
        if (jobs[jobId].status != Status.OPEN) revert JobNotOpen();

        jobs[jobId].status = Status.ACCEPTED;
        jobs[jobId].acceptedAt = block.timestamp;

        emit JobAccepted(jobId);
    }

    /**
     * @notice Freelancer submits proof of work (IPFS hash).
     *         Can only be called once per review cycle (status must be ACCEPTED).
     * @param jobId     The ID of the job.
     * @param ipfsHash  The IPFS hash of the delivered work.
     */
    function submitProof(uint256 jobId, string calldata ipfsHash)
        external
        jobExists(jobId)
        onlyFreelancer(jobId)
    {
        Job storage job = jobs[jobId];
        if (job.status == Status.OPEN) revert JobNotAccepted();
        if (job.status == Status.PROOF_SUBMITTED) revert ProofAlreadySubmitted();
        if (job.status == Status.COMPLETED) revert JobAlreadyCompleted();
        if (bytes(ipfsHash).length == 0) revert EmptyProofHash();

        job.proofHash = ipfsHash;
        job.status = Status.PROOF_SUBMITTED;
        job.proofSubmittedAt = block.timestamp;

        emit ProofSubmitted(jobId);
    }

    /**
     * @notice Client releases a partial or full payment to the freelancer.
     *         Proof must have been submitted first.
     *         If full escrow is released, the job is marked COMPLETED.
     * @param jobId   The ID of the job.
     * @param amount  The amount (in wei) to release.
     */
    function releasePayment(uint256 jobId, uint256 amount)
        external
        jobExists(jobId)
        onlyClient(jobId)
        nonReentrant
    {
        Job storage job = jobs[jobId];
        if (job.status != Status.PROOF_SUBMITTED) revert ProofNotSubmitted();

        uint256 remaining = job.totalAmount - job.releasedAmount;
        if (amount == 0 || amount > remaining) revert AmountExceedsEscrow();

        job.releasedAmount += amount;

        (bool success, ) = job.freelancer.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit PaymentReleased(jobId, amount);

        if (job.releasedAmount == job.totalAmount) {
            _completeJob(jobId);
        }
    }

    /**
     * @notice Freelancer can claim all remaining escrow if the client has not
     *         released payment within 48 hours of proof submission.
     * @param jobId The ID of the job.
     */
    function claimPaymentIfClientInactive(uint256 jobId)
        external
        jobExists(jobId)
        onlyFreelancer(jobId)
        nonReentrant
    {
        Job storage job = jobs[jobId];
        if (job.status != Status.PROOF_SUBMITTED) revert ProofNotSubmitted();
        if (block.timestamp < job.proofSubmittedAt + 48 hours) revert TooEarlyForClaim();

        uint256 remaining = job.totalAmount - job.releasedAmount;
        job.releasedAmount = job.totalAmount;

        (bool success, ) = job.freelancer.call{value: remaining}("");
        if (!success) revert TransferFailed();

        emit PaymentReleased(jobId, remaining);
        _completeJob(jobId);
    }

    /**
     * @notice Allows the client to top up escrow for a non-completed job.
     * @param jobId The ID of the job.
     */
    function depositEscrowPayment(uint256 jobId) external payable jobExists(jobId) onlyClient(jobId) {
        if (msg.value == 0) revert NoPaymentProvided();
        if (jobs[jobId].status == Status.COMPLETED) revert JobAlreadyCompleted();

        jobs[jobId].totalAmount += msg.value;
    }

    /**
     * @notice Returns the trust score for a given address.
     * @dev    Score = (completedJobs * 2) + successfulPayments
     * @param user The address to score.
     * @return The trust score.
     */
    function getTrustScore(address user) external view returns (uint256) {
        return (completedJobs[user] * 2) + successfulPayments[user];
    }

    // -------------------------------------------------------------------------
    // Internal Helpers
    // -------------------------------------------------------------------------

    /**
     * @dev Marks a job as completed and updates trust score counters.
     */
    function _completeJob(uint256 jobId) internal {
        Job storage job = jobs[jobId];
        job.status = Status.COMPLETED;

        completedJobs[job.freelancer]++;
        successfulPayments[job.client]++;

        emit JobCompleted(jobId);
    }
}
