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

    function setUp() public {
        escrow = new ProofPayEscrow();
        vm.deal(client, 10 ether);
        vm.deal(freelancer, 0);
    }

    // 1. Client creates job and deposits funds
    function testCreateJob() public {
        vm.startPrank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer);
        vm.stopPrank();

        (
            address jobClient,
            address jobFreelancer,
            uint256 payment,
            string memory proofHash,
            bool accepted,
            bool completed
        ) = escrow.jobs(jobId);

        assertEq(jobClient, client);
        assertEq(jobFreelancer, freelancer);
        assertEq(payment, INITIAL_PAYMENT);
        assertEq(proofHash, "");
        assertEq(accepted, false);
        assertEq(completed, false);
    }

    // 2. Freelancer accepts job
    function testAcceptJob() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer);

        vm.prank(freelancer);
        escrow.acceptJob(jobId);

        (,,,,bool accepted,) = escrow.jobs(jobId);
        assertTrue(accepted);
    }

    // 3. Freelancer submits proof
    function testSubmitProof() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer);

        vm.prank(freelancer);
        escrow.acceptJob(jobId);

        vm.prank(freelancer);
        escrow.submitProof(jobId, PROOF_HASH);

        (,,,string memory proofHash,,) = escrow.jobs(jobId);
        assertEq(proofHash, PROOF_HASH);
    }

    // 4. Client approves work and 5. Freelancer receives payment
    function testApproveWork() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer);

        vm.prank(freelancer);
        escrow.acceptJob(jobId);

        vm.prank(freelancer);
        escrow.submitProof(jobId, PROOF_HASH);

        uint256 freelancerBalanceBefore = freelancer.balance;

        vm.prank(client);
        escrow.approveWork(jobId);

        (,,,,,bool completed) = escrow.jobs(jobId);
        assertTrue(completed);
        assertEq(freelancer.balance, freelancerBalanceBefore + INITIAL_PAYMENT);
    }

    // Explicit check for custom error on non-freelancer submit proof
    function testRevertNonFreelancerCannotSubmitProof() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer);

        vm.prank(freelancer);
        escrow.acceptJob(jobId);

        vm.prank(stranger);
        vm.expectRevert(ProofPayEscrow.NotFreelancer.selector);
        escrow.submitProof(jobId, PROOF_HASH);
    }

    // Edge Case: non-client cannot approve
    function testRevertNonClientCannotApprove() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer);

        vm.prank(freelancer);
        escrow.acceptJob(jobId);

        vm.prank(stranger);
        vm.expectRevert(ProofPayEscrow.NotClient.selector);
        escrow.approveWork(jobId);
    }

    function testRevertSubmitProofWithoutAccepting() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer);

        vm.prank(freelancer);
        vm.expectRevert(ProofPayEscrow.JobNotAccepted.selector);
        escrow.submitProof(jobId, PROOF_HASH);
    }

    function testDepositEscrowPayment() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob{value: INITIAL_PAYMENT}(freelancer);

        vm.deal(client, 2 ether);
        vm.prank(client);
        escrow.depositEscrowPayment{value: 0.5 ether}(jobId);

        (,,uint256 payment,,,) = escrow.jobs(jobId);
        assertEq(payment, INITIAL_PAYMENT + 0.5 ether);
    }
}
