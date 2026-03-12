// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title ProofPayRegistry
 * @dev Tracks freelancer reputation including completed jobs, ratings, and reputation scores.
 */
contract ProofPayRegistry {

    struct FreelancerStats {
        uint256 completedJobs;
        uint256 totalRating;
        uint256 ratingCount;
    }

    // State variables
    mapping(address => FreelancerStats) public freelancerStats;
    // Track who has rated whom to ensure fairness (optional but recommended for production)
    mapping(address => mapping(address => bool)) public hasRated;

    // Events
    event JobRecorded(address indexed freelancer, uint256 totalCompleted);
    event FreelancerRated(address indexed freelancer, address indexed rater, uint256 rating);

    // Custom Errors
    error InvalidRating();
    error FreelancerAddressZero();
    error AlreadyRated();

    /**
     * @notice Records a completed job for a freelancer.
     * @param freelancer The address of the freelancer who completed the job.
     */
    function recordCompletion(address freelancer) external {
        if (freelancer == address(0)) revert FreelancerAddressZero();
        
        freelancerStats[freelancer].completedJobs += 1;
        
        emit JobRecorded(freelancer, freelancerStats[freelancer].completedJobs);
    }

    /**
     * @notice Allows a user to rate a freelancer for their work.
     * @param freelancer The address of the freelancer being rated.
     * @param rating The rating value (1-5).
     */
    function rateFreelancer(address freelancer, uint256 rating) external {
        if (freelancer == address(0)) revert FreelancerAddressZero();
        if (rating < 1 || rating > 5) revert InvalidRating();
        // Prevent double rating from the same address for simplicity in this version
        if (hasRated[msg.sender][freelancer]) revert AlreadyRated();

        FreelancerStats storage stats = freelancerStats[freelancer];
        stats.totalRating += rating;
        stats.ratingCount += 1;
        hasRated[msg.sender][freelancer] = true;

        emit FreelancerRated(freelancer, msg.sender, rating);
    }

    /**
     * @notice Computes and returns the reputation score of a freelancer.
     * @dev Score is calculated as (Average Rating * 100). Returns 0 if no ratings exist.
     * @param freelancer The address of the freelancer.
     * @return score The calculated reputation score.
     */
    function getReputation(address freelancer) external view returns (uint256 score) {
        FreelancerStats storage stats = freelancerStats[freelancer];
        
        if (stats.ratingCount == 0) {
            return 0;
        }

        // Return average rating scaled by 100 (e.g., 4.5 becomes 450)
        return (stats.totalRating * 100) / stats.ratingCount;
    }

    /**
     * @notice Returns the full stats for a freelancer.
     * @param freelancer The address of the freelancer.
     */
    function getFreelancerStats(address freelancer) external view returns (uint256 completed, uint256 avgRatingScaled) {
        FreelancerStats storage stats = freelancerStats[freelancer];
        completed = stats.completedJobs;
        avgRatingScaled = stats.ratingCount == 0 ? 0 : (stats.totalRating * 100) / stats.ratingCount;
    }
}
