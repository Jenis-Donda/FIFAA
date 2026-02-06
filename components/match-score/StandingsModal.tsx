"use client";

import { useEffect } from "react";
import type { Standing } from "@/lib/types";

type StandingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  standings: Standing[];
  competition: string;
  competitionLogo?: string;
  seasonName?: string;
};

export default function StandingsModal({
  isOpen,
  onClose,
  standings,
  competition,
  competitionLogo,
  seasonName,
}: StandingsModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div className="flex items-center gap-4">
            {competitionLogo ? (
              <img
                src={competitionLogo}
                alt={competition}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement | null;
                  if (target) target.src = "/images/fallback.png";
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {competition.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-navy-950">{competition}</h2>
              {seasonName && (
                <p className="text-sm text-gray-500">{seasonName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-medium text-gray-700">LAST 5 MATCHES</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">W</span>
                </div>
                <span className="text-gray-600">Win</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">D</span>
                </div>
                <span className="text-gray-600">Draw</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">L</span>
                </div>
                <span className="text-gray-600">Loss</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-[10px] font-bold">-</span>
                </div>
                <span className="text-gray-600">Not played</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy-950 text-white sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-semibold w-16"></th>
                <th className="px-4 py-3 text-left font-semibold">TEAM</th>
                <th className="px-4 py-3 text-center font-semibold w-12">P</th>
                <th className="px-4 py-3 text-center font-semibold w-12">W</th>
                <th className="px-4 py-3 text-center font-semibold w-12">D</th>
                <th className="px-4 py-3 text-center font-semibold w-12">L</th>
                <th className="px-4 py-3 text-center font-semibold w-12">GF</th>
                <th className="px-4 py-3 text-center font-semibold w-12">GA</th>
                <th className="px-4 py-3 text-center font-semibold w-12">GD</th>
                <th className="px-4 py-3 text-center font-semibold w-14">PTS</th>
                <th className="px-4 py-3 text-center font-semibold w-36">FORM</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, index) => {
                // Use real form data from API, fallback to empty form if not available
                const formResults = row.form || ["-", "-", "-", "-", "-"];
                
                return (
                  <tr
                    key={row.position}
                    className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${
                      index < 4 ? "bg-blue-50/30" : ""
                    }`}
                  >
                    {/* Position */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-950 w-6">{row.position}</span>
                        {row.position <= 4 && (
                          <div className="w-1 h-4 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </td>

                    {/* Team */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {row.teamLogo ? (
                          <img
                            src={row.teamLogo}
                            alt={row.team}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement | null;
                              if (target) target.src = "/images/fallback.png";
                            }}
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                            {row.teamAbbr.substring(0, 2)}
                          </div>
                        )}
                        <span className="font-medium text-navy-950">{row.team}</span>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="px-4 py-3 text-center text-gray-700">{row.played}</td>
                    <td className="px-4 py-3 text-center text-gray-700 font-medium">{row.won}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{row.drawn}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{row.lost}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{row.goalsFor}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{row.goalsAgainst}</td>
                    <td className={`px-4 py-3 text-center font-medium ${
                      row.goalDiff > 0 ? "text-green-600" : row.goalDiff < 0 ? "text-red-600" : "text-gray-700"
                    }`}>
                      {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-navy-950">{row.points}</td>

                    {/* Form */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {[...formResults].reverse().map((result, i) => (
                          <div
                            key={i}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                              result === "W"
                                ? "bg-green-500"
                                : result === "D"
                                ? "bg-gray-400"
                                : result === "L"
                                ? "bg-red-500"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {result === "-" ? "" : result}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
