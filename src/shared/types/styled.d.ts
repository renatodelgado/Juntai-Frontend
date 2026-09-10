import 'styled-components';
import type { AppTheme } from '@/shared/styles/theme';

declare module 'styled-components' {
  // A interface permite estender a tipagem do tema da biblioteca por module augmentation.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends AppTheme {}
}
