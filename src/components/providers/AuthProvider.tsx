import { ReactNode, useEffect, useState } from "react";
import { initializeAnnouncements } from "../../lib/announcements-store";
import { initializeAttendance } from "../../lib/attendance-store";
import { initializeDocumentRequests } from "../../lib/documents-store";
import { initializeEvents } from "../../lib/events-store";
import { initializeMessages } from "../../lib/messages-store";
import { initializeSchedules } from "../../lib/schedule-store";
import { initializeSemesters } from "../../lib/semester-store";
import { getCurrentUser, getUserById, getUsers, initializeStore, isStudent, setCurrentUser, User, login as storeLogin, logout as storeLogout } from "../../lib/store";
import { initializeAuditLog } from "../../lib/audit-store";
import { initializeForum } from "../../lib/forum-store";
import { initializeCommunity } from "../../lib/community-store";
import { initializeLibrary } from "../../lib/library-store";
import { initializeNotifications } from "../../lib/notifications";
import { AuthContext } from "../../contexts/authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await initializeStore(); // async : hashe les mots de passe du seed + migration
            initializeNotifications();
            initializeEvents();
            initializeAnnouncements();
            initializeForum();
            initializeCommunity();
            initializeAuditLog();
            initializeLibrary();
            initializeSchedules();
            initializeSemesters();
            initializeDocumentRequests();
            initializeMessages();

            const users = getUsers();
            const students = users.filter(u => isStudent(u.role) && u.is_active);
            const studentData = students.map(s => ({ id: s.id, name: s.nom_complet }));
            const allCourses = [
                { id: "lic-l1-1", name: "Introduction à l'informatique" },
                { id: "lic-l2-1", name: "Algorithmique avancée" },
                { id: "lic-l2-2", name: "Base de données" },
            ];
            initializeAttendance(studentData, allCourses);

            setUser(getCurrentUser());
            setLoading(false);
        };
        init();
    }, []);

    const login = async (email: string, password: string) => {
        const result = await storeLogin(email, password);
        if (result.success && result.user) {
            setUser(result.user);
        } else if (result.error === "PAYMENT_BLOCKED" && result.user) {
            setUser(result.user);
        }
        return { success: result.success, error: result.error };
    }

    const logout = () => {
        storeLogout();
        setUser(null);
    };

    const refreshUser = () => {
        const current = getCurrentUser();
        if (current) {
            const fresh = getUserById(current.id);
            if (fresh) {
                setCurrentUser(fresh);
                setUser(fresh);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}