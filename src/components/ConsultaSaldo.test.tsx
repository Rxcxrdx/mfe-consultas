import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ConsultaSaldo from './ConsultaSaldo';

const mockSaldo = {
  cuentaId: '1001',
  obligatoria: 15230000,
  voluntaria: 4200000,
  cesantias: 3100000,
  moneda: 'COP',
  actualizadoEn: '2026-07-18T10:00:00.000Z',
};

describe('ConsultaSaldo', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSaldo),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('carga y muestra el saldo obligatorio por defecto', async () => {
    render(<ConsultaSaldo cuentaId="1001" />);

    expect(screen.getByText(/cargando saldo/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('saldo-valor')).toHaveTextContent('Saldo obligatoria');
    });

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/saldos/1001');
  });

  it('cambia el saldo mostrado al seleccionar otro tipo de cuenta', async () => {
    render(<ConsultaSaldo cuentaId="1001" />);

    await waitFor(() => {
      expect(screen.getByTestId('saldo-valor')).toHaveTextContent('Saldo obligatoria');
    });

    fireEvent.change(screen.getByLabelText(/tipo de cuenta/i), {
      target: { value: 'voluntaria' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('saldo-valor')).toHaveTextContent('Saldo voluntaria');
    });
  });

  it('muestra un mensaje de error si la petición falla', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

    render(<ConsultaSaldo cuentaId="1001" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar el saldo');
    });
  });
});
