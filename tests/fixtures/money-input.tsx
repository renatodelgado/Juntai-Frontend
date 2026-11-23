import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import { MoneyInput } from '../../src/shared/components/forms/Fields';
import { theme } from '../../src/shared/styles/theme';

function Fixture() {
  const [value, setValue] = useState<number | null>(null);
  return (
    <ThemeProvider theme={theme}>
      <MoneyInput
        id="amount"
        label="Valor"
        value={value}
        onValueChange={setValue}
      />
      <output data-testid="value">{value === null ? 'null' : value}</output>
      <button onClick={() => setValue(1234.56)}>Restaurar</button>
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
