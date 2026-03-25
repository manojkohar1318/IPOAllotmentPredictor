import { PrivacyPolicy } from '@/components/PrivacyPolicy';

export const metadata = {
  title: "Privacy Policy — NEPSE IPO Allotment Predictor",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy lang="EN" isDark={true} />;
}
