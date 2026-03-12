// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {ProofPayRegistry} from "../src/ProofPayRegistry.sol";

contract ProofPayRegistryTest is Test {
    ProofPayRegistry public registry;

    address public freelancer = address(0x2);
    address public rater1 = address(0x11);
    address public rater2 = address(0x12);

    function setUp() public {
        registry = new ProofPayRegistry();
    }

    function testRecordCompletion() public {
        registry.recordCompletion(freelancer);
        (uint256 completed,) = registry.getFreelancerStats(freelancer);
        assertEq(completed, 1);

        registry.recordCompletion(freelancer);
        (completed,) = registry.getFreelancerStats(freelancer);
        assertEq(completed, 2);
    }

    function testRateFreelancer() public {
        vm.prank(rater1);
        registry.rateFreelancer(freelancer, 5);

        uint256 reputation = registry.getReputation(freelancer);
        // Scaled by 100, so 5 should be 500
        assertEq(reputation, 500);
    }

    function testAverageReputation() public {
        vm.prank(rater1);
        registry.rateFreelancer(freelancer, 5);

        vm.prank(rater2);
        registry.rateFreelancer(freelancer, 4);

        // Average (5+4)/2 = 4.5. Scaled by 100 is 450
        uint256 reputation = registry.getReputation(freelancer);
        assertEq(reputation, 450);
    }

    function testRevertInvalidRating() public {
        vm.expectRevert(ProofPayRegistry.InvalidRating.selector);
        registry.rateFreelancer(freelancer, 6);

        vm.expectRevert(ProofPayRegistry.InvalidRating.selector);
        registry.rateFreelancer(freelancer, 0);
    }

    function testRevertAlreadyRated() public {
        vm.prank(rater1);
        registry.rateFreelancer(freelancer, 5);

        vm.prank(rater1);
        vm.expectRevert(ProofPayRegistry.AlreadyRated.selector);
        registry.rateFreelancer(freelancer, 4);
    }

    function testGetReputationNoRatings() public {
        uint256 reputation = registry.getReputation(freelancer);
        assertEq(reputation, 0);
    }
}
