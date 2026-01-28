"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const WithdrawSection = () => {
  const { address: connectedAddress } = useAccount();
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { data: memberInfo } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "getMemberInfo",
    args: [connectedAddress],
  });

  const { writeContractAsync: withdraw, isPending: isWithdrawPending } = useScaffoldWriteContract("InvestmentPool");

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    try {
      await withdraw({
        functionName: "withdraw",
        args: [parseEther(withdrawAmount)],
      });
      setWithdrawAmount("");
    } catch (error) {
      console.error("Error al retirar:", error);
    }
  };

  const handleWithdrawAll = () => {
    if (memberInfo && memberInfo[0] > 0n) {
      setWithdrawAmount(formatEther(memberInfo[0]));
    }
  };

  const userBalance = memberInfo ? Number(formatEther(memberInfo[0])) : 0;
  const isActive = memberInfo ? memberInfo[2] : false;

  if (!isActive) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">💸 Retirar Fondos</h2>
          <div className="alert alert-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="font-bold">No eres miembro activo</h3>
              <div className="text-sm">Debes depositar fondos primero para poder realizar retiros.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">
          💸 Retirar Fondos
          <div className="badge badge-accent">Gestión de Balance</div>
        </h2>

        <div className="alert alert-info mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h3 className="font-bold">Retira tus fondos cuando quieras</h3>
            <div className="text-xs">
              Puedes retirar todo o parte de tu balance. Si retiras todo, dejarás de ser miembro activo del pool.
            </div>
          </div>
        </div>

        {/* Balance disponible */}
        <div className="stats shadow mb-6">
          <div className="stat">
            <div className="stat-figure text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Tu Balance Disponible</div>
            <div className="stat-value text-primary">{userBalance.toFixed(4)} ETH</div>
            <div className="stat-desc">Fondos disponibles para retirar</div>
          </div>
        </div>

        {/* Formulario de retiro */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Cantidad a retirar (ETH)</span>
            <span className="label-text-alt">
              Disponible: <span className="font-bold text-primary">{userBalance.toFixed(4)} ETH</span>
            </span>
          </label>
          <div className="join">
            <input
              type="number"
              placeholder="0.0"
              className="input input-bordered join-item flex-1"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              step="0.01"
              max={userBalance}
            />
            <button
              className="btn btn-error join-item"
              onClick={handleWithdraw}
              disabled={isWithdrawPending || !withdrawAmount || parseFloat(withdrawAmount) > userBalance}
            >
              {isWithdrawPending ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Retirando...
                </>
              ) : (
                "Retirar"
              )}
            </button>
          </div>
          <label className="label">
            <span className="label-text-alt text-gray-500">
              {withdrawAmount && parseFloat(withdrawAmount) > userBalance && (
                <span className="text-error">⚠️ El monto excede tu balance disponible</span>
              )}
            </span>
          </label>
        </div>

        {/* Botones rápidos */}
        <div className="mt-4">
          <p className="text-sm font-semibold mb-2">Montos rápidos:</p>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setWithdrawAmount((userBalance * 0.25).toFixed(4))}
              disabled={userBalance === 0}
            >
              25%
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setWithdrawAmount((userBalance * 0.5).toFixed(4))}
              disabled={userBalance === 0}
            >
              50%
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setWithdrawAmount((userBalance * 0.75).toFixed(4))}
              disabled={userBalance === 0}
            >
              75%
            </button>
            <button
              className="btn btn-sm btn-outline btn-error"
              onClick={handleWithdrawAll}
              disabled={userBalance === 0}
            >
              Todo (100%)
            </button>
          </div>
        </div>

        {/* Advertencia al retirar todo */}
        {withdrawAmount && parseFloat(withdrawAmount) === userBalance && userBalance > 0 && (
          <div className="alert alert-warning mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="font-bold">⚠️ Atención</h3>
              <div className="text-sm">
                Al retirar todo tu balance, dejarás de ser miembro activo y no podrás crear propuestas hasta que
                vuelvas a depositar.
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 bg-base-200 rounded-lg p-4">
          <h3 className="font-bold mb-2">ℹ️ Información importante:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Los fondos se transferirán directamente a tu wallet</li>
            <li>Las transacciones son irreversibles</li>
            <li>Puedes volver a depositar en cualquier momento</li>
            <li>No hay penalización por retirar fondos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
