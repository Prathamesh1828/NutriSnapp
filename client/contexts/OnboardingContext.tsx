'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface OnboardingMemberData {
    // Step 1 - Profile
    name: string;
    avatar?: string;
    age: number;
    gender: string;
    // Step 2 - Body Stats
    height: number;
    weight: number;
    bodyType?: string;
    // Step 3 - Goal
    goal: 'cut' | 'bulk' | 'maintain' | '';
    experience: string;
    // Step 4 - Activity
    activityLevel: string;
    // Step 5 - Targets
    calories: number;
    protein: number;
    water: number;
    aiAdaptive: boolean;
    notifications: boolean;
}

interface OnboardingCoachData {
    // Step 1 - Profile
    name: string;
    bio: string;
    certification: string;
    avatar?: string;
    experience: string;
    // Step 2 - Specialty
    specialties: string[];
    primaryFocus: string;
    coachingStyle: string;
    // Step 3 - Clients
    clientVolume: string;
    inviteEmails: string[];
    // Step 4 - Workspace
    workspaceName: string;
    location: string;
    defaultProgramStyle: string;
    checkInFrequency: string;
    notificationPrefs: {
        onMealLog: boolean;
        onWorkoutComplete: boolean;
        onMissedCheckin: boolean;
        weeklyDigest: boolean;
    };
}

interface OnboardingContextType {
    memberData: OnboardingMemberData;
    coachData: OnboardingCoachData;
    updateMemberData: (data: Partial<OnboardingMemberData>) => void;
    updateCoachData: (data: Partial<OnboardingCoachData>) => void;
    resetMemberData: () => void;
    resetCoachData: () => void;
}

const defaultMemberData: OnboardingMemberData = {
    name: '', age: 25, gender: 'male', height: 175, weight: 70,
    goal: '', experience: '', activityLevel: '',
    calories: 2000, protein: 150, water: 2500,
    aiAdaptive: false, notifications: true,
};

const defaultCoachData: OnboardingCoachData = {
    name: '', bio: '', certification: '', experience: '',
    specialties: [], primaryFocus: '', coachingStyle: '',
    clientVolume: '', inviteEmails: [],
    workspaceName: '', location: '',
    defaultProgramStyle: '', checkInFrequency: 'weekly',
    notificationPrefs: {
        onMealLog: true, onWorkoutComplete: true,
        onMissedCheckin: true, weeklyDigest: true,
    },
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [memberData, setMemberData] = useState<OnboardingMemberData>(defaultMemberData);
    const [coachData, setCoachData] = useState<OnboardingCoachData>(defaultCoachData);

    const updateMemberData = useCallback((data: Partial<OnboardingMemberData>) => {
        setMemberData((prev) => ({ ...prev, ...data }));
    }, []);

    const updateCoachData = useCallback((data: Partial<OnboardingCoachData>) => {
        setCoachData((prev) => ({ ...prev, ...data }));
    }, []);

    const resetMemberData = useCallback(() => setMemberData(defaultMemberData), []);
    const resetCoachData = useCallback(() => setCoachData(defaultCoachData), []);

    return (
        <OnboardingContext.Provider value={{ memberData, coachData, updateMemberData, updateCoachData, resetMemberData, resetCoachData }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const ctx = useContext(OnboardingContext);
    if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
    return ctx;
}
