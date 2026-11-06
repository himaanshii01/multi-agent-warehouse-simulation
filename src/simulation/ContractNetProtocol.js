/**
 * Strategy B: Decentralized Negotiation (Contract Net Protocol - FIPA standard)
 * 
 * Process:
 * 1. Call For Proposals (CFP) announced to robot community.
 * 2. Each robot agent autonomously perceives task and submits bid.
 * 3. Auctioneer / Task Manager evaluates proposals.
 * 4. Contract awarded to optimal bidder (lowest cost bid).
 * 5. Rejection notices sent to other bidders; winner confirms acceptance.
 * 
 * Communication Overhead:
 * Significantly higher than centralized (CFP broadcasts + Bids + Rejections + Award + Ack).
 * Provides resilience against single-point-of-failure and local autonomous decision-making.
 */

import { ORDER_STATUS } from './OrderManager.js';

export class ContractNetProtocol {
  constructor() {
    this.activeAuctions = []; // Current active auctions
    this.auctionHistory = []; // Past completed auctions for UI inspection
    this.totalProtocolMessages = 0;
  }

  reset() {
    this.activeAuctions = [];
    this.auctionHistory = [];
    this.totalProtocolMessages = 0;
  }

  /**
   * Run auction step for pending orders
   */
  processAuctions(simEngine) {
    const pendingOrders = simEngine.orderManager.orders.filter(
      o => o.status === ORDER_STATUS.PENDING
    );

    // Eligible robots to bid: not failed, battery >= 25%, not currently delivering cargo
    const eligibleRobots = simEngine.robots.filter(
      r => !r.isFailed && r.battery >= 25 && (!r.currentOrder || r.status === 'IDLE')
    );

    if (pendingOrders.length === 0 || eligibleRobots.length === 0) return;

    // Pick top priority pending order to auction
    const priorityWeights = { CRITICAL: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
    pendingOrders.sort(
      (a, b) => (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0)
    );

    const orderToAuction = pendingOrders[0];
    orderToAuction.status = ORDER_STATUS.BIDDING;

    // 1. ANNOUNCEMENT: Broadcast CFP to all eligible agents
    // Message count: N broadcast calls
    const broadcastCount = eligibleRobots.length;
    this.totalProtocolMessages += broadcastCount;
    simEngine.communicationMessages += broadcastCount;

    simEngine.logEvent(
      'BID',
      `[CONTRACT NET] Call For Proposals (CFP) announced for Order [${orderToAuction.id}] (${orderToAuction.productName}) to ${eligibleRobots.length} robots.`,
      { orderId: orderToAuction.id, robotCount: eligibleRobots.length }
    );

    // 2. BIDDING: Each robot autonomously calculates bid
    const bids = [];
    eligibleRobots.forEach(robot => {
      robot.status = 'BIDDING';
      const bid = robot.calculateBid(orderToAuction);
      bids.push(bid);

      // Record in robot's local history
      robot.biddingHistory.unshift({
        orderId: orderToAuction.id,
        bidValue: bid.bidValue,
        valid: bid.valid,
        timestamp: new Date().toLocaleTimeString()
      });
      if (robot.biddingHistory.length > 10) robot.biddingHistory.pop();
    });

    // Message count: N bid responses
    this.totalProtocolMessages += bids.length;
    simEngine.communicationMessages += bids.length;

    // 3. BID EVALUATION: Find minimum valid bid
    const validBids = bids.filter(b => b.valid && b.bidValue < Infinity);
    validBids.sort((a, b) => a.bidValue - b.bidValue);

    const auctionRecord = {
      orderId: orderToAuction.id,
      productName: orderToAuction.productName,
      priority: orderToAuction.priority,
      timestamp: new Date().toLocaleTimeString(),
      tick: simEngine.currentTick,
      bids: bids.map(b => ({ ...b })),
      winnerId: null,
      winningBid: null
    };

    if (validBids.length > 0) {
      const winnerBid = validBids[0];
      const winningRobot = simEngine.robots.find(r => r.id === winnerBid.robotId);

      auctionRecord.winnerId = winnerBid.robotId;
      auctionRecord.winningBid = winnerBid.bidValue;

      // 4. AWARD & NOTIFICATION:
      // Award to winner (1 msg) + Rejection to others (N - 1 msgs) + Ack from winner (1 msg)
      const awardAndRejectCount = 1 + (eligibleRobots.length - 1) + 1;
      this.totalProtocolMessages += awardAndRejectCount;
      simEngine.communicationMessages += awardAndRejectCount;

      orderToAuction.status = ORDER_STATUS.ASSIGNED;
      orderToAuction.assignedRobotId = winningRobot.id;
      orderToAuction.assignedAtTick = simEngine.currentTick;
      orderToAuction.allocationMode = 'DECENTRALIZED';
      orderToAuction.bidData = {
        winningBid: winnerBid.bidValue,
        totalBidders: bids.length,
        bids: bids
      };

      winningRobot.assignOrder(orderToAuction, simEngine);

      // Reset other bidding robots back to IDLE
      eligibleRobots.forEach(robot => {
        if (robot.id !== winningRobot.id && robot.status === 'BIDDING') {
          robot.status = 'IDLE';
        }
      });

      simEngine.logEvent(
        'BID',
        `[CONTRACT NET] Contract AWARDED to Robot ${winningRobot.name} (Winning Bid: ${winnerBid.bidValue}). Total msgs exchanged: ${broadcastCount + bids.length + awardAndRejectCount}.`,
        {
          orderId: orderToAuction.id,
          winnerId: winningRobot.id,
          bidValue: winnerBid.bidValue,
          allBids: bids
        }
      );
    } else {
      // No valid bids, revert order back to PENDING for next tick
      orderToAuction.status = ORDER_STATUS.PENDING;
      eligibleRobots.forEach(robot => {
        if (robot.status === 'BIDDING') robot.status = 'IDLE';
      });

      simEngine.logEvent(
        'BID',
        `[CONTRACT NET] No valid proposals received for Order [${orderToAuction.id}]. Re-queued in backlog.`,
        { orderId: orderToAuction.id }
      );
    }

    this.auctionHistory.unshift(auctionRecord);
    if (this.auctionHistory.length > 25) {
      this.auctionHistory.pop();
    }
  }
}
