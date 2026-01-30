// packages/nextjs/components/investment-pool/AdminManagement.tsx

"use client";

import { useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const AdminManagement = () => {
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [adminToRemove, setAdminToRemove] = useState("");

  const ADMIN_ROLE = "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775" as `0x${string}`;

  // Verificar si una dirección es admin
  const { data: isNewAddressAdmin } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "hasRole",
    args: [ADMIN_ROLE, newAdminAddress as `0x${string}`],
  });

  const { writeContractAsync: grantRole, isPending: isGranting } = useScaffoldWriteContract("InvestmentPool");
  const { writeContractAsync: revokeRole, isPending: isRevoking } = useScaffoldWriteContract("InvestmentPool");

  const handleAddAdmin = async () => {
    if (!newAdminAddress || newAdminAddress.length !== 42) {
      alert("Por favor ingresa una dirección válida");
      return;
    }

    try {
      await grantRole({
        functionName: "grantRole",
        args: [ADMIN_ROLE, newAdminAddress as `0x${string}`],
      });
      setNewAdminAddress("");
      alert("✅ Administrador agregado exitosamente");
    } catch (error) {
      console.error("Error al agregar admin:", error);
      alert("❌ Error al agregar administrador");
    }
  };

  const handleRemoveAdmin = async () => {
    if (!adminToRemove || adminToRemove.length !== 42) {
      alert("Por favor ingresa una dirección válida");
      return;
    }

    if (!confirm(`¿Estás seguro de remover el rol de admin a ${adminToRemove}?`)) {
      return;
    }

    try {
      await revokeRole({
        functionName: "revokeRole",
        args: [ADMIN_ROLE, adminToRemove as `0x${string}`],
      });
      setAdminToRemove("");
      alert("✅ Administrador removido exitosamente");
    } catch (error) {
      console.error("Error al remover admin:", error);
      alert("❌ Error al remover administrador");
    }
  };

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            👥 Gestión de Administradores
            <div className="badge badge-warning">Super Admin</div>
          </h2>

          {/* Agregar Admin */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">➕ Agregar Nuevo Administrador</h3>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Dirección del nuevo admin</span>
              </label>
              <div className="join">
                <input
                  type="text"
                  placeholder="0x..."
                  className="input input-bordered join-item flex-1"
                  value={newAdminAddress}
                  onChange={e => setNewAdminAddress(e.target.value)}
                />
                <button
                  className="btn btn-primary join-item"
                  onClick={handleAddAdmin}
                  disabled={isGranting || !newAdminAddress}
                >
                  {isGranting ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Agregando...
                    </>
                  ) : (
                    "Agregar Admin"
                  )}
                </button>
              </div>

              {newAdminAddress && newAdminAddress.length === 42 && (
                <label className="label">
                  <span className="label-text-alt">
                    {isNewAddressAdmin ? (
                      <span className="text-warning">⚠️ Esta dirección ya es administrador</span>
                    ) : (
                      <span className="text-success">✓ Dirección válida</span>
                    )}
                  </span>
                </label>
              )}
            </div>

            <div className="alert alert-info mt-4">
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
                <h4 className="font-bold">Permisos de Admin</h4>
                <div className="text-xs">
                  Los administradores pueden aprobar, rechazar y ejecutar propuestas de inversión.
                </div>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* Remover Admin */}
          <div>
            <h3 className="font-bold text-lg mb-3">➖ Remover Administrador</h3>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Dirección del admin a remover</span>
              </label>
              <div className="join">
                <input
                  type="text"
                  placeholder="0x..."
                  className="input input-bordered join-item flex-1"
                  value={adminToRemove}
                  onChange={e => setAdminToRemove(e.target.value)}
                />
                <button
                  className="btn btn-error join-item"
                  onClick={handleRemoveAdmin}
                  disabled={isRevoking || !adminToRemove}
                >
                  {isRevoking ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Removiendo...
                    </>
                  ) : (
                    "Remover Admin"
                  )}
                </button>
              </div>
            </div>

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
                <h4 className="font-bold">⚠️ Advertencia</h4>
                <div className="text-xs">
                  Al remover un admin, esa dirección perderá todos los permisos administrativos inmediatamente.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="font-bold">ℹ️ Información sobre Roles</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>DEFAULT_ADMIN_ROLE:</strong> Super admin, puede gestionar otros admins</li>
            <li><strong>ADMIN_ROLE:</strong> Admin normal, puede aprobar/rechazar/ejecutar propuestas</li>
            <li>Solo el DEFAULT_ADMIN puede agregar o remover otros admins</li>
            <li>El deployer del contrato es DEFAULT_ADMIN por defecto</li>
          </ul>
        </div>
      </div>
    </div>
  );
};