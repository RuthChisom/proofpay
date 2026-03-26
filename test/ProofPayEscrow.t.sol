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
    string public constant JOB_TITLE = "Build landing page";

    function setUp() public {
        escrow = new ProofPayEscrow();
        vm.deal(client, 10 ether);
        vm.deal(freelancer, 0);
    }

    // -------------------------------------------------------------------------
    // Helper: run through full flow up to proof submitted
    // -------------------------------------------------------------------------
    function _createAcceptSubmit() internal returns (uint256 jobId) {
        vm.prank(client);
        jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer, JOB_TITLE);

        vm.prank(freelancer);
        escrow.acceptJob(jobId);

        vm.prank(freelancer);
        escrow.submitProof(jobId, PROOF_HASH);
    }

    // -------------------------------------------------------------------------
    // Step 2 / 3: createJob — struct fields and escrow lock
    // -------------------------------------------------------------------------
    function testCreateJob() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer, JOB_TITLE);

        (
            address jobClient,
            address jobFreelancer,
            uint256 totalAmount,
            uint256 releasedAmount,
            uint256 createdAt,
            uint256 acceptedAt,
            uint256 proofSubmittedAt,
            ProofPayEscrow.Status status,
            string memory proofHash,
            string memory jobTitle
        ) = escrow.jobs(jobId);

        assertEq(jobClient, client);
        assertEq(jobFreelancer, freelancer);
        assertEq(totalAmount, INITIAL_PAYMENT);
        assertEq(releasedAmount, 0);
        assertGt(createdAt, 0);
        assertEq(acceptedAt, 0);
        assertEq(proofSubmittedAt, 0);
        assertEq(uint256(status), uint256(ProofPayEscrow.Status.OPEN));
        assertEq(proofHash, "");
        assertEq(jobTitle, JOB_TITLE);
        assertEq(address(escrow).balance, INITIAL_PAYMENT);
    }

    function testRevertCreateJobNoPayment() public {
        vm.prank(client);
        vm.expectRevert(ProofPayEscrow.NoPaymentProvided.selector);
        escrow.createJob{value: 0}(freelancer, JOB_TITLE);
    }

    function testRevertCreateJobEmptyTitle() public {
        vm.prank(client);
        vm.expectRevert(ProofPayEscrow.EmptyJobTitle.selector);
        escrow.createJob{value: INITIAL_PAYMENT}(freelancer, "");
    }

    // -------------------------------------------------------------------------
    // acceptJob
    // -------------------------------------------------------------------------
    function testAcceptJob() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer, JOB_TITLE);

        vm.prank(freelancer);
        escrow.acceptJob(jobId);

        (,,,,, uint256 acceptedAt,, ProofPayEscrow.Status status,,) = escrow.jobs(jobId);
        assertEq(uint256(status), uint256(ProofPayEscrow.Status.ACCEPTED));
        assertGt(acceptedAt, 0);
    }

    function testRevertAcceptJobNotOpen() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer, JOB_TITLE);

        vm.prank(freelancer);
        escrow.acceptJob(jobId);

        // Second accept should fail — status is now ACCEPTED not OPEN
        vm.prank(freelancer);
        vm.expectRevert(ProofPayEscrow.JobNotOpen.selector);
        escrow.acceptJob(jobId);
    }

    // -------------------------------------------------------------------------
    // submitProof
    // -------------------------------------------------------------------------
    function testSubmitProof() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer, JOB_TITLE);

        vm.prank(freelancer);
        escrow.acceptJob(jobId);

        vm.prank(freelancer);
        escrow.submitProof(jobId, PROOF_HASH);

        (,,,,,, uint256 proofSubmittedAt, ProofPayEscrow.Status status, string memory proofHash,) = escrow.jobs(jobId);
        assertEq(uint256(status), uint256(ProofPayEscrow.Status.PROOF_SUBMITTED));
        assertEq(proofHash, PROOF_HASH);
        assertGt(proofSubmittedAt, 0);
    }

    function testRevertSubmitProofWithoutAccepting() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer, JOB_TITLE);

        vm.prank(freelancer);
        vm.expectRevert(ProofPayEscrow.JobNotAccepted.selector);
        escrow.submitProof(jobId, PROOF_HASH);
    }

    // Step 9: freelancer cannot submit proof twice without review
    function testRevertDoubleProofSubmission() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer, JOB_TITLE);

        vm.prank(freelancer);
        escrow.acceptJob(jobId);

        vm.prank(freelancer);
        escrow.submitProof(jobId, PROOF_HASH);

        vm.prank(freelancer);
        vm.expectRevert(ProofPayEscrow.ProofAlreadySubmitted.selector);
        escrow.submitProof(jobId, "QmOtherHash");
    }

    function testRevertNonFreelancerCannotSubmitProof() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer, JOB_TITLE);

        vm.prank(freelancer);
        escrow.acceptJob(jobId);

        vm.prank(stranger);
        vm.expectRevert(ProofPayEscrow.NotFreelancer.selector);
        escrow.submitProof(jobId, PROOF_HASH);
    }

    // -------------------------------------------------------------------------
    // Step 4 / 5: releasePayment — partial and full
    // -------------------------------------------------------------------------
    function testReleasePaymentFull() public {
        uint256 jobId = _createAcceptSubmit();

        uint256 balBefore = freelancer.balance;

        vm.prank(client);
        escrow.releasePayment(jobId, INITIAL_PAYMENT);

        assertEq(freelancer.balance, balBefore + INITIAL_PAYMENT);

        (,,, uint256 releasedAmount,,,,ProofPayEscrow.Status status,,) = escrow.jobs(jobId);
        assertEq(releasedAmount, INITIAL_PAYMENT);
        assertEq(uint256(status), uint256(ProofPayEscrow.Status.COMPLETED));
    }

    function testReleasePaymentPartial() public {
        uint256 jobId = _createAcceptSubmit();

        uint256 half = INITIAL_PAYMENT / 2;
        uint256 balBefore = freelancer.balance;

        vm.prank(client);
        escrow.releasePayment(jobId, half);

        assertEq(freelancer.balance, balBefore + half);

        // Status should still be PROOF_SUBMITTED (not yet fully paid)
        (,,, uint256 releasedAmount,,,,ProofPayEscrow.Status status,,) = escrow.jobs(jobId);
        assertEq(releasedAmount, half);
        assertEq(uint256(status), uint256(ProofPayEscrow.Status.PROOF_SUBMITTED));

        // Release the rest
        vm.prank(client);
        escrow.releasePayment(jobId, half);

        (,,, uint256 releasedAmount2,,,,ProofPayEscrow.Status status2,,) = escrow.jobs(jobId);
        assertEq(releasedAmount2, INITIAL_PAYMENT);
        assertEq(uint256(status2), uint256(ProofPayEscrow.Status.COMPLETED));
    }

    // Step 5: payment cannot be released before proof submission
    function testRevertReleasePaymentBeforeProof() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer, JOB_TITLE);

        vm.prank(freelancer);
        escrow.acceptJob(jobId);

        vm.prank(client);
        vm.expectRevert(ProofPayEscrow.ProofNotSubmitted.selector);
        escrow.releasePayment(jobId, INITIAL_PAYMENT);
    }

    // Step 9: amount cannot exceed escrow balance
    function testRevertReleasePaymentExceedsEscrow() public {
        uint256 jobId = _createAcceptSubmit();

        vm.prank(client);
        vm.expectRevert(ProofPayEscrow.AmountExceedsEscrow.selector);
        escrow.releasePayment(jobId, INITIAL_PAYMENT + 1 wei);
    }

    function testRevertNonClientCannotReleasePayment() public {
        uint256 jobId = _createAcceptSubmit();

        vm.prank(stranger);
        vm.expectRevert(ProofPayEscrow.NotClient.selector);
        escrow.releasePayment(jobId, INITIAL_PAYMENT);
    }

    // -------------------------------------------------------------------------
    // Step 6: claimPaymentIfClientInactive
    // -------------------------------------------------------------------------
    function testClaimPaymentAfter48Hours() public {
        uint256 jobId = _createAcceptSubmit();

        // Warp past 48 hours
        vm.warp(block.timestamp + 48 hours + 1);

        uint256 balBefore = freelancer.balance;

        vm.prank(freelancer);
        escrow.claimPaymentIfClientInactive(jobId);

        assertEq(freelancer.balance, balBefore + INITIAL_PAYMENT);

        (,,,,,,, ProofPayEscrow.Status status,,) = escrow.jobs(jobId);
        assertEq(uint256(status), uint256(ProofPayEscrow.Status.COMPLETED));
    }

    function testRevertClaimTooEarly() public {
        uint256 jobId = _createAcceptSubmit();

        // Only 24 hours have passed — not enough
        vm.warp(block.timestamp + 24 hours);

        vm.prank(freelancer);
        vm.expectRevert(ProofPayEscrow.TooEarlyForClaim.selector);
        escrow.claimPaymentIfClientInactive(jobId);
    }

    function testRevertClaimWithoutProof() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer, JOB_TITLE);

        vm.prank(freelancer);
        escrow.acceptJob(jobId);

        vm.warp(block.timestamp + 48 hours + 1);

        vm.prank(freelancer);
        vm.expectRevert(ProofPayEscrow.ProofNotSubmitted.selector);
        escrow.claimPaymentIfClientInactive(jobId);
    }

    // -------------------------------------------------------------------------
    // Step 7: Trust scores
    // -------------------------------------------------------------------------
    function testTrustScoreAfterCompletion() public {
        uint256 jobId = _createAcceptSubmit();

        vm.prank(client);
        escrow.releasePayment(jobId, INITIAL_PAYMENT);

        assertEq(escrow.completedJobs(freelancer), 1);
        assertEq(escrow.successfulPayments(client), 1);

        // getTrustScore: freelancer = (1 * 2) + 0 = 2
        assertEq(escrow.getTrustScore(freelancer), 2);
        // getTrustScore: client = (0 * 2) + 1 = 1
        assertEq(escrow.getTrustScore(client), 1);
    }

    function testTrustScoreAccumulatesAcrossJobs() public {
        // Job 1
        uint256 jobId1 = _createAcceptSubmit();
        vm.prank(client);
        escrow.releasePayment(jobId1, INITIAL_PAYMENT);

        // Job 2
        vm.prank(client);
        uint256 jobId2 = escrow.createJob{value: INITIAL_PAYMENT}(freelancer, "Second job");
        vm.prank(freelancer);
        escrow.acceptJob(jobId2);
        vm.prank(freelancer);
        escrow.submitProof(jobId2, PROOF_HASH);
        vm.prank(client);
        escrow.releasePayment(jobId2, INITIAL_PAYMENT);

        assertEq(escrow.completedJobs(freelancer), 2);
        assertEq(escrow.successfulPayments(client), 2);
        assertEq(escrow.getTrustScore(freelancer), 4); // 2*2 + 0
        assertEq(escrow.getTrustScore(client), 2);     // 0*2 + 2
    }

    // -------------------------------------------------------------------------
    // depositEscrowPayment
    // -------------------------------------------------------------------------
    function testDepositEscrowPayment() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer, JOB_TITLE);

        vm.prank(client);
        escrow.depositEscrowPayment{value: 0.5 ether}(jobId);

        (,, uint256 totalAmount,,,,,,,) = escrow.jobs(jobId);
        assertEq(totalAmount, INITIAL_PAYMENT + 0.5 ether);
    }

    function testRevertDepositOnCompletedJob() public {
        uint256 jobId = _createAcceptSubmit();

        vm.prank(client);
        escrow.releasePayment(jobId, INITIAL_PAYMENT);

        vm.prank(client);
        vm.expectRevert(ProofPayEscrow.JobAlreadyCompleted.selector);
        escrow.depositEscrowPayment{value: 0.5 ether}(jobId);
    }
}
