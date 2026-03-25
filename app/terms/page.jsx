import { TermsOfService } from '@/components/TermsOfService';

export const metadata = {
  title: "Terms & Conditions — NEPSE IPO Allotment Predictor",
};

export default function Terms() {
  return <TermsOfService lang="EN" isDark={true} />;
}
