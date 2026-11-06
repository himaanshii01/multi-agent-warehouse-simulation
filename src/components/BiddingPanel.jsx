import React from 'react';
import { Radio, Gavel, Award, MessageSquare, Check, X, ShieldAlert, Cpu } from 'lucide-react';

export default function BiddingPanel({ simulationEngine, simulationState }) {
  const auctionHistory = simulationState.auctionHistory || [];
  const latestAuction = auctionHistory[0];

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 flex flex-col h-full shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-[#131D30] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gavel className="w-4 h-4 text-purple-400" />
          <h3 className="font-semibold text-sm text-white font-mono uppercase tracking-wider">
            Contract Net Protocol (Auction Engine)
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-purple-300">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>FIPA CNP Protocol</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Latest Active / Recent Auction Card */}
        {latestAuction ? (
          <div className="bg-slate-900/90 rounded-xl border border-purple-500/30 p-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                  Most Recent Task Announcement
                </span>
                <h4 className="font-mono font-bold text-white text-sm">
                  {latestAuction.orderId}: {latestAuction.productName}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono block">
                  Tick #{latestAuction.tick} &bull; {latestAuction.timestamp}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800 font-mono">
                  {latestAuction.bids.length} Proposals Submitted
                </span>
              </div>
            </div>

            {/* Bids Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                    <th className="pb-2">Robot Candidate</th>
                    <th className="pb-2">Dist to Pickup</th>
                    <th className="pb-2">Dist to Dock</th>
                    <th className="pb-2">Battery</th>
                    <th className="pb-2">Calculated Bid</th>
                    <th className="pb-2 text-right">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {latestAuction.bids.map((b) => {
                    const isWinner = b.robotId === latestAuction.winnerId;
                    return (
                      <tr
                        key={b.robotId}
                        className={`transition-colors ${
                          isWinner ? 'bg-emerald-950/30 font-semibold' : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-2.5 flex items-center space-x-2">
                          {isWinner && <Award className="w-3.5 h-3.5 text-emerald-400" />}
                          <span className={isWinner ? 'text-emerald-300' : 'text-slate-200'}>
                            {b.robotName}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-300">{b.distToPickup ?? 'N/A'} cells</td>
                        <td className="py-2.5 text-slate-300">{b.distDelivery ?? 'N/A'} cells</td>
                        <td className="py-2.5">
                          <span className={b.battery < 25 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                            {b.battery ? `${b.battery}%` : 'Low'}
                          </span>
                        </td>
                        <td className="py-2.5">
                          {b.valid ? (
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              isWinner ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-300'
                            }`}>
                              {b.bidValue}
                            </span>
                          ) : (
                            <span className="text-rose-400 text-[11px] italic">Invalid ({b.reason})</span>
                          )}
                        </td>
                        <td className="py-2.5 text-right">
                          {isWinner ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider font-bold">
                              CONTRACT WON
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Rejected</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Formula Explanation Callout */}
            <div className="mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="text-purple-400 font-semibold">Mathematical Bid Formulation: </span>
              Bid = 1.0 &times; Dist(Robot, Pickup) + 0.5 &times; Dist(Pickup, Delivery) - 0.15 &times; Battery% + WorkloadPenalty
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            <Radio className="w-8 h-8 mx-auto mb-2 opacity-40 animate-pulse text-purple-400" />
            No Contract Net auctions triggered yet. Switch coordination mode to "Contract Net Protocol" or wait for next order.
          </div>
        )}

        {/* Historical Auctions Accordion / Log */}
        {auctionHistory.length > 1 && (
          <div className="mt-4">
            <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Past Auction Records ({auctionHistory.length})
            </h5>
            <div className="space-y-2">
              {auctionHistory.slice(1, 6).map((auc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-200">{auc.orderId}: {auc.productName}</span>
                    <span className="text-[10px] text-slate-500 ml-2">({auc.timestamp})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400">Winner: <strong>{auc.winnerId}</strong></span>
                    <span className="text-slate-400">Bid: {auc.winningBid}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
