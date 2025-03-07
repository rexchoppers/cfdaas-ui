import {createContext, ReactNode, useContext, useState} from "react";
import {Company} from "../types/Company.ts";

interface CompanyContextProps {
    selectedCompany: Company;
    setSelectedCompany: (company: Company) => void;
}

const CompanyContext = createContext<CompanyContextProps | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
    const [selectedCompany, setSelectedCompany] = useState({} as Company)

    return (
        <CompanyContext.Provider value={{ selectedCompany, setSelectedCompany }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);

    if (context === undefined) {
        throw new Error("useCompany must be used within a CompanyProvider");
    }

    return context;
};
