// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {ProofPayEscrow} from "../src/ProofPayEscrow.sol";

contract ProofPayEscrowTest is Test {
    ProofPayEscrow public escrow;

    address public client = address(0x1);
    address public freelancer = address(0x2);
    address public stranger = address(0x3);

    uint256 public constant INITIAL_PAYMENT = 1 ether;
    string public constant PROOF_HASH = "QmTest123";
    string public constant JOB_TITLE = "Build a website";

    function setUp() public {
        escrow = new ProofPayEscrow();
        vm.deal(client, 10 ether);
        vm.deal(freelancer, 0);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    function _createJob() internal returns (uint256) {
        vm.prank(client);
        return escrow.createJob{value: INITIAL_PAYMENT}(freelancer, JOB_TITLE);
    }

    function _createAndAccept() internal returns (uint256) {
        uint256 jobId = _createJob();
        vm.prank(freelancer);
        escrow.acceptJob(jobId);
        return jobId;
    }

    function _createAcceptAndSubmitProof() internal returns (uint256) {
        uint256 jobId = _createAndAccept();
        vm.prank(freelancer);
        escrow.submitProof(jobId, PROOF_HASH);
        return jobId;
    }

    // ─── Step 2: Job struct fields ────────────────────────────────────────────

    function testCreateJob() public {
        uint256 jobId = _createJob();

        (
            address jobClient,
            address jobFreelancer,
            uint256 totalAmount,
            uint256 releasedAmount,
            uint256 createdAt,
            uint256 acceptedAt,
            uint256 proofSubmittedAt,
            ProofPayEscrow.Status status,
            string memory jobTitle,
            string memory proofHash
        ) = escrow.jobs(jobId);

        assertEq(jobClient, client);
        assertEq(jobFreelancer, freelancer);
        assertEq(totalAmount, INITIAL_PAYMENT);
        assertEq(releasedAmount, 0);
        assertGt(createdAt, 0);
        assertEq(acceptedAt, 0);
        assertEq(proofSubmittedAt, 0);
        assertEq(uint8(status), uint8(ProofPayEscrow.Status.PENDING));
        assertEq(jobTitle, JOB_TITLE);
        assertEq(proofHash, "");
    }

    // ─── Step 3: Escrow verified at creation ──────────────────────────────────

    function testCreateJobRequiresPayment() public {
        vm.prank(client);
        vm.expectRevert(ProofPayEscrow.NoPaymentProvided.selector);
        escrow.createJob{value: 0}(freelancer, JOB_TITLE);
    }

    function testCreateJobRequiresValidFreelancer() public {
        vm.prank(client);
        vm.expectRevert(ProofPayEscrow.InvalidFreelancer.selector);
        escrow.createJob{value: INITIAL_PAYMENT}(address(0), JOB_TITLE);
    }

    // ─── Accept job ───────────────────────────────────────────────────────────

    function testAcceptJob() public {
        uint256 jobId = _createAndAccept();

        (,,,,, uint256 acceptedAt,, ProofPayEscrow.Status status,,) = escrow.jobs(jobId);
        assertEq(uint8(status), uint8(ProofPayEscrow.Status.ACCEPTED));
        assertGt(acceptedAt, 0);
    }

    function testRevertAcceptJobTwice() public {
        uint256 jobId = _createAndAccept();
        vm.prank(freelancer);
        vm.expectRevert(ProofPayEscrow.JobAlreadyAccepted.selector);
        escrow.acceptJob(jobId);
    }

    // ─── Submit proof ─────────────────────────────────────────────────────────

    function testSubmitProof() public {
        uint256 jobId = _createAcceptAndSubmitProof();

        (,,,,,,uint256 proofSubmittedAt, ProofPayEscrow.Status status,, string memory proofHash) = escrow.jobs(jobId);
        assertEq(uint8(status), uint8(ProofPayEscrow.Status.PROOF_SUBMITTED));
        assertGt(proofSubmittedAt, 0);
        assertEq(proofHash, PROOF_HASH);
    }

    function testRevertSubmitProofWithoutAccepting() public {
        uint256 jobId = _createJob();
        vm.prank(freelancer);
        vm.expectRevert(ProofPayEscrow.JobNotAccepted.selector);
        escrow.submitProof(jobId, PROOF_HASH);
    }

    // ─── Step 9: No double proof submission ───────────────────────────────────

    function testRevertSubmitProofTwice() public {
        uint256 jobId = _createAcceptAndSubmitProof();
        vm.prank(freelancer);
        vm.expectRevert(ProofPayEscrow.JobNotAccepted.selector);
        escrow.submitProof(jobId, "QmNewHash");
    }

    // ─── Step 5 + 4: releasePayment requires proof ────────────────────────────

    function testReleasePaymentRequiresProof() public {
        uint256 jobId = _createAndAccept();
        vm.prank(client);
        vm.expectRevert(ProofPayEscrow.ProofNotSubmitted.selector);
        escrow.releasePayment(jobId, INITIAL_PAYMENT);
    }

    // ─── Step 4: Partial payment release ─────────────────────────────────────

    function testReleasePaymentPartial() public {
        uint256 jobId = _createAcceptAndSubmitProof();
        uint256 partial = 0.4 ether;

        vm.prank(client);
        escrow.releasePayment(jobId, partial);

        (,, uint256 totalAmount, uint256 releasedAmount,,,,ProofPayEscrow.Status status,,) = escrow.jobs(jobId);
        assertEq(releasedAmount, partial);
        assertEq(totalAmount, INITIAL_PAYMENT);
        assertEq(uint8(status), uint8(ProofPayEscrow.Status.PROOF_SUBMITTED));
        assertEq(freelancer.balance, partial);
    }

    function testReleasePaymentFull() public {
        uint256 jobId = _createAcceptAndSubmitProof();

        vm.prank(client);
        escrow.releasePayment(jobId, INITIAL_PAYMENT);

        (,, uint256 totalAmount, uint256 releasedAmount,,,,ProofPayEscrow.Status status,,) = escrow.jobs(jobId);
        assertEq(releasedAmount, totalAmount);
        assertEq(uint8(status), uint8(ProofPayEscrow.Status.COMPLETED));
        assertEq(freelancer.balance, INITIAL_PAYMENT);
    }

    // ─── Step 9: Payments cannot exceed escrow ────────────────────────────────

    function testReleasePaymentExceedsEscrow() public {
        uint256 jobId = _createAcceptAndSubmitProof();
        vm.prank(client);
        vm.expectRevert(ProofPayEscrow.InsufficientEscrow.selector);
        escrow.releasePayment(jobId, INITIAL_PAYMENT + 1);
    }

    // ─── approveWork (backward compat) ────────────────────────────────────────

    function testApproveWork() public {
        uint256 jobId = _createAcceptAndSubmitProof();
        uint256 freelancerBefore = freelancer.balance;

        vm.prank(client);
        escrow.approveWork(jobId);

        (,,,,,,, ProofPayEscrow.Status status,,) = escrow.jobs(jobId);
        assertEq(uint8(status), uint8(ProofPayEscrow.Status.COMPLETED));
        assertEq(freelancer.balance, freelancerBefore + INITIAL_PAYMENT);
    }

    function testApproveWorkRequiresProof() public {
        uint256 jobId = _createAndAccept();
        vm.prank(client);
        vm.expectRevert(ProofPayEscrow.ProofNotSubmitted.selector);
        escrow.approveWork(jobId);
    }

    function testRevertNonClientCannotApprove() public {
        uint256 jobId = _createAcceptAndSubmitProof();
        vm.prank(stranger);
        vm.expectRevert(ProofPayEscrow.NotClient.selector);
        escrow.approveWork(jobId);
    }

    function testRevertNonFreelancerCannotSubmitProof() public {
        uint256 jobId = _createAndAccept();
        vm.prank(stranger);
        vm.expectRevert(ProofPayEscrow.NotFreelancer.selector);
        escrow.submitProof(jobId, PROOF_HASH);
    }

    // ─── Step 6: Auto-release after 48 hours ─────────────────────────────────

    function testClaimPaymentAfter48h() public {
        uint256 jobId = _createAcceptAndSubmitProof();

        vm.warp(block.timestamp + 48 hours + 1);
        vm.prank(freelancer);
        escrow.claimPaymentIfClientInactive(jobId);

        (,,,,,,, ProofPayEscrow.Status status,,) = escrow.jobs(jobId);
        assertEq(uint8(status), uint8(ProofPayEscrow.Status.COMPLETED));
        assertEq(freelancer.balance, INITIAL_PAYMENT);
    }

    function testClaimPaymentBefore48h() public {
        uint256 jobId = _createAcceptAndSubmitProof();

        vm.warp(block.timestamp + 47 hours);
        vm.prank(freelancer);
        vm.expectRevert(ProofPayEscrow.AutoReleaseNotReady.selector);
        escrow.claimPaymentIfClientInactive(jobId);
    }

    function testClaimPaymentRequiresProof() public {
        uint256 jobId = _createAndAccept();
        vm.warp(block.timestamp + 48 hours + 1);
        vm.prank(freelancer);
        vm.expectRevert(ProofPayEscrow.ProofNotSubmitted.selector);
        escrow.claimPaymentIfClientInactive(jobId);
    }

    // ─── Step 9: Cancel job (client cannot cancel after acceptance) ───────────

    function testCancelJobPending() public {
        uint256 jobId = _createJob();
        uint256 clientBefore = client.balance;

        vm.prank(client);
        escrow.cancelJob(jobId);

        (,,,,,,, ProofPayEscrow.Status status,,) = escrow.jobs(jobId);
        assertEq(uint8(status), uint8(ProofPayEscrow.Status.CANCELLED));
        assertEq(client.balance, clientBefore + INITIAL_PAYMENT);
    }

    function testCancelJobAfterAccept() public {
        uint256 jobId = _createAndAccept();
        vm.prank(client);
        vm.expectRevert(ProofPayEscrow.JobNotCancellable.selector);
        escrow.cancelJob(jobId);
    }

    // ─── Step 7: Trust score ──────────────────────────────────────────────────

    function testTrustScoreAfterCompletion() public {
        uint256 jobId = _createAcceptAndSubmitProof();

        vm.prank(client);
        escrow.approveWork(jobId);

        assertEq(escrow.completedJobs(freelancer), 1);
        assertEq(escrow.successfulPayments(client), 1);
        // getTrustScore: (1 * 2) + 1 = 3 for freelancer; (0 * 2) + 1 = 1 for client
        assertEq(escrow.getTrustScore(freelancer), 3);
        assertEq(escrow.getTrustScore(client), 1);
    }

    function testTrustScoreAfterAutoRelease() public {
        uint256 jobId = _createAcceptAndSubmitProof();

        vm.warp(block.timestamp + 48 hours + 1);
        vm.prank(freelancer);
        escrow.claimPaymentIfClientInactive(jobId);

        assertEq(escrow.completedJobs(freelancer), 1);
        assertEq(escrow.successfulPayments(client), 1);
        assertEq(escrow.getTrustScore(freelancer), 3);
    }

    function testTrustScoreAfterPartialThenFullRelease() public {
        uint256 jobId = _createAcceptAndSubmitProof();

        vm.prank(client);
        escrow.releasePayment(jobId, 0.5 ether);
        // Not yet completed
        assertEq(escrow.completedJobs(freelancer), 0);

        vm.prank(client);
        escrow.releasePayment(jobId, 0.5 ether);
        // Now completed
        assertEq(escrow.completedJobs(freelancer), 1);
        assertEq(escrow.getTrustScore(freelancer), 3);
    }

    // ─── depositEscrowPayment ─────────────────────────────────────────────────

    function testDepositEscrowPayment() public {
        uint256 jobId = _createJob();

        vm.deal(client, 2 ether);
        vm.prank(client);
        escrow.depositEscrowPayment{value: 0.5 ether}(jobId);

        (,, uint256 totalAmount,,,,,,,) = escrow.jobs(jobId);
        assertEq(totalAmount, INITIAL_PAYMENT + 0.5 ether);
    }
}
