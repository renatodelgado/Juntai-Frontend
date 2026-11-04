import type { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { ProfileSidebar } from '@/shared/components/profile/ProfileSidebar';
import { investorTheme } from '@/shared/styles/theme';
import type { Discovery } from '../useDiscovery';
import * as S from '../Explore.styles';

export function DiscoveryLayout({
  data,
  children,
}: {
  data: Discovery;
  children: ReactNode;
}) {
  return (
    <ThemeProvider theme={investorTheme}>
      <S.Shell>
        <ProfileSidebar approved={data.approved} />
        <S.Main>
          {data.notice && (
            <div className="notice" role="status">
              {data.notice}
            </div>
          )}
          {children}
        </S.Main>
      </S.Shell>
    </ThemeProvider>
  );
}
