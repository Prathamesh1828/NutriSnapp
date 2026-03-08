import { OnboardingProvider } from '@/contexts/OnboardingContext';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <OnboardingProvider>
            <div className="min-h-screen bg-[#0A0A0F] relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#B8FF3C]/[0.03] blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#10b981]/[0.03] blur-3xl" />
                </div>
                <div className="relative z-10 min-h-screen flex flex-col">
                    {children}
                </div>
            </div>
        </OnboardingProvider>
    );
}
