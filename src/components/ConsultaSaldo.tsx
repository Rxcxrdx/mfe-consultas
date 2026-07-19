import React, { useEffect, useState } from 'react';

type TipoCuenta = 'obligatoria' | 'voluntaria' | 'cesantias';

interface Saldo {
  cuentaId: string;
  obligatoria: number;
  voluntaria: number;
  cesantias: number;
  moneda: string;
  actualizadoEn: string;
}

interface Props {
  cuentaId?: string;
}

const API_URL = process.env.API_URL || 'http://localhost:3001';

function formatoMoneda(valor: number, moneda: string): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: moneda }).format(valor);
}

export default function ConsultaSaldo({ cuentaId = '1001' }: Props) {
  const [tipo, setTipo] = useState<TipoCuenta>('obligatoria');
  const [saldo, setSaldo] = useState<Saldo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    fetch(`${API_URL}/api/saldos/${cuentaId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }
        return res.json();
      })
      .then((data: Saldo) => {
        if (!cancelado) setSaldo(data);
      })
      .catch((err: Error) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [cuentaId]);

  return (
    <div data-testid="consulta-saldo" style={{ padding: '1rem' }}>
      <h2>Consulta de saldo</h2>

      <label htmlFor="tipo-cuenta">Tipo de cuenta</label>
      <select
        id="tipo-cuenta"
        value={tipo}
        onChange={(e) => setTipo(e.target.value as TipoCuenta)}
      >
        <option value="obligatoria">Obligatoria</option>
        <option value="voluntaria">Voluntaria</option>
        <option value="cesantias">Cesantías</option>
      </select>

      {cargando && <p>Cargando saldo...</p>}
      {error && <p role="alert">No se pudo cargar el saldo: {error}</p>}
      {saldo && !cargando && !error && (
        <p data-testid="saldo-valor">
          Saldo {tipo}: {formatoMoneda(saldo[tipo], saldo.moneda)}
        </p>
      )}
    </div>
  );
}
