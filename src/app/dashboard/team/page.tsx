"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // <-- Fixed import
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import EmptyState from '@/components/EmptyState';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';

// --- Icons ---
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /> </svg> );
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /> </svg> );
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg>);
const UserGroupIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-3.741-.97m-3.741 0a9.094 9.094 0 00-3.741.97m7.482 0a9.094 9.094 0 01-3.741-.97m3.741 0c-.393.16-1.183.3-2.12.39m-3.741 0c-.937-.09-1.727-.23-2.12-.39m3.741 0a9.094 9.094 0 00-3.741-.97m0 0c-2.062 0-3.8-1.34-4.24-3.235a9.094 9.094 0 010-3.135 4.238 4.238 0 014.24-3.235m0 0c2.063 0 3.8 1.34 4.24 3.235m0 0a9.094 9.094 0 010 3.135m-4.24 0c-.44 1.895-2.177 3.235-4.24 3.235m12.731 0a9.094 9.094 0 00-3.741-.97m3.741 0c.393.16 1.183.3 2.12.39m3.741 0c.937-.09 1.727-.23 2.12-.39m-3.741 0a9.094 9.094 0 013.741-.97m0 0c2.063 0 3.8-1.34 4.24-3.235a9.094 9.094 0 000-3.135 4.238 4.238 0 00-4.24-3.235m0 0c-2.062 0-3.8 1.34-4.24 3.235m0 0a9.094 9.094 0 000 3.135m4.24 0c.44 1.895 2.177 3.235 4.24 3.235z" /> </svg> );
const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /> </svg> );

// --- TYPE DEFINITIONS ---
type TeamMember = {
    id: string;
    created_at: string;
    user_id: string;
    profile_id: string;
    name: string;
    role: string | null;
    bio: string | null;
    avatar_url: string | null;
    avatar_storage_path: string | null;
    display_order: number;
};
type TeamMemberFormData = Omit<TeamMember, 'id' | 'created_at' | 'user_id' | 'profile_id'>;
type ModalState = { isOpen: boolean; mode: 'add' | 'edit'; data: TeamMember | null; };

// --- ADD/EDIT MODAL ---
interface TeamMemberModalProps {
    modalState: ModalState;
    onClose: () => void;
    onSave: (formData: TeamMemberFormData, avatarFile: File | null, isRemovingAvatar: boolean, id?: string) => Promise<void>;
    isSaving: boolean;
}
function TeamMemberModal({ modalState, onClose, onSave, isSaving }: TeamMemberModalProps) {
    if (!modalState.isOpen) return null;

    const [formData, setFormData] = useState<TeamMemberFormData>(
        modalState.mode === 'edit' && modalState.data
        ? { name: modalState.data.name, role: modalState.data.role ?? '', bio: modalState.data.bio ?? '', display_order: modalState.data.display_order ?? 0, avatar_url: modalState.data.avatar_url, avatar_storage_path: modalState.data.avatar_storage_path }
        : { name: '', role: '', bio: '', display_order: 0, avatar_url: null, avatar_storage_path: null }
    );
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(formData.avatar_url);
    const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: TeamMemberFormData) => ({ ...prev, [name]: name === 'display_order' ? parseInt(value) || 0 : value }));
        setLocalError(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setIsRemovingAvatar(false);
        }
    };
    
    const handleRemoveImage = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setIsRemovingAvatar(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        if (!formData.name.trim()) {
            setLocalError("Der Name darf nicht leer sein.");
            return;
        }
        await onSave(formData, avatarFile, isRemovingAvatar, modalState.data?.id);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-slate-700 relative max-h-[90vh] flex flex-col">
                 <button onClick={onClose} disabled={isSaving} className="absolute top-4 right-4 text-slate-400 hover:text-white disabled:opacity-50"> <XMarkIcon className="h-6 w-6" /> </button>
                <h2 className="text-xl font-semibold text-white mb-6"> {modalState.mode === 'add' ? 'Neues Team-Mitglied' : 'Team-Mitglied bearbeiten'} </h2>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Profilbild</label>
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 h-24 w-24 flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-500 overflow-hidden">
                                {avatarPreview ? ( <img src={avatarPreview} alt="Avatar Vorschau" className="h-full w-full object-cover" /> ) : ( <UserGroupIcon className="h-12 w-12" /> )}
                            </div>
                            <div className="flex-grow space-y-2">
                                <input type="file" id="avatarUpload" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-slate-800"/>
                                {avatarPreview && <button type="button" onClick={handleRemoveImage} className="text-xs text-red-400 hover:text-red-300">Bild entfernen</button>}
                            </div>
                        </div>
                    </div>
                    <div> <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Name *</label> <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" /> </div>
                    <div> <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-1">Position / Rolle</label> <input type="text" name="role" id="role" value={formData.role ?? ''} onChange={handleChange} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder="z.B. Geschäftsführer, Meister, Geselle" /> </div>
                    <div> <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-1">Kurz-Bio</label> <textarea name="bio" id="bio" rows={3} value={formData.bio ?? ''} onChange={handleChange} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder="z.B. Experte für Badsanierung seit 10 Jahren..."/> </div>
                    <div> <label htmlFor="display_order" className="block text-sm font-medium text-slate-300 mb-1">Sortier-Reihenfolge</label> <input type="number" name="display_order" id="display_order" value={formData.display_order} onChange={handleChange} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" /> <p className="text-xs text-slate-500 mt-1">Niedrigere Zahlen werden zuerst angezeigt (z.B. 0, 1, 2...).</p> </div>
                    {localError && <p className="text-sm text-red-500">{localError}</p>}
                </form>
                <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-700"> 
                    <button type="button" onClick={onClose} disabled={isSaving} className="rounded-md px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50"> Abbrechen </button>
                    <button type="button" onClick={handleSubmit} disabled={isSaving} className={`inline-flex items-center gap-x-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${ isSaving ? 'bg-orange-800 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}> {isSaving && <ArrowPathIcon className="h-4 w-4 animate-spin" />} {isSaving ? 'Wird gespeichert...' : 'Speichern'} </button> 
                </div>
            </div>
        </div>
    );
}

// --- MAIN PAGE COMPONENT ---
export default function TeamManagementPage() {
    const supabase = useMemo(() => createSupabaseClient(), []);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<{ id: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<Record<string, 'delete' | 'save' | null>>({});
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, mode: 'add', data: null });
    const [deleteConfirmState, setDeleteConfirmState] = useState<{ isOpen: boolean; member: TeamMember | null }>({ isOpen: false, member: null });
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    
    const router = useRouter();
    
    const fetchTeamMembers = useCallback(async (user: User) => {
        setLoading(true); setError(null);
        
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
        
        if (profileError || !profileData) {
            console.error('Error fetching user profile:', profileError);
            setError('Fehler beim Laden des Benutzerprofils.');
            setLoading(false);
            return;
        }
        setProfile(profileData);

        const { data, error: fetchError } = await supabase
            .from('team_members')
            .select('*')
            .eq('user_id', user.id)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: true });
            
        if (fetchError) { 
            console.error('Error fetching team members:', fetchError); 
            setError(`Mitglieder konnten nicht geladen werden: ${fetchError.message}`); 
            setTeamMembers([]); 
        } else { 
            setTeamMembers(data || []);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        const getUserAndData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) router.push('/login');
            else { 
                setCurrentUser(user); 
                await fetchTeamMembers(user); 
            }
        };
        getUserAndData();
    }, [router, fetchTeamMembers, supabase.auth]);

    const openAddModal = () => setModalState({ isOpen: true, mode: 'add', data: null });
    const openEditModal = (member: TeamMember) => setModalState({ isOpen: true, mode: 'edit', data: member });
    const closeModal = () => { if (actionLoading.modal === 'save') return; setModalState({ isOpen: false, mode: 'add', data: null }); }
    const setLoadingState = (id: string | 'modal', type: 'delete' | 'save' | null) => { setActionLoading((prev: typeof actionLoading) => ({ ...prev, [id]: type })); };

    const handleSaveMember = async (formData: TeamMemberFormData, avatarFile: File | null, isRemovingAvatar: boolean, id?: string) => {
        if (!currentUser || !profile) return;
        setLoadingState('modal', 'save');

        let dataToUpsert: Omit<TeamMember, 'id' | 'created_at'> = {
            ...formData,
            user_id: currentUser.id,
            profile_id: profile.id
        };

        const toastId = toast.loading(id ? 'Wird gespeichert...' : 'Wird erstellt...');
        try {
            if (isRemovingAvatar && id && formData.avatar_storage_path) {
                await supabase.storage.from('team-avatars').remove([formData.avatar_storage_path]);
                dataToUpsert.avatar_url = null;
                dataToUpsert.avatar_storage_path = null;
            }

            if (avatarFile) {
                const memberId = id || (modalState.data?.id || crypto.randomUUID());
                const filePath = `${currentUser.id}/${memberId}/avatar.${avatarFile.name.split('.').pop()}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('team-avatars')
                    .upload(filePath, avatarFile, { upsert: true });
                if (uploadError) throw uploadError;
                
                const { data: urlData } = supabase.storage.from('team-avatars').getPublicUrl(uploadData.path);
                dataToUpsert.avatar_url = urlData.publicUrl;
                dataToUpsert.avatar_storage_path = uploadData.path;
            }

            const { error: upsertError } = await supabase
                .from('team_members')
                .upsert(id ? { id, ...dataToUpsert } : dataToUpsert);
            if (upsertError) throw upsertError;

            toast.success("Erfolgreich gespeichert!", { id: toastId });
            closeModal();
            fetchTeamMembers(currentUser);
        } catch (err: any) {
            toast.error(`Fehler: ${err.message}`, { id: toastId });
        }
        setLoadingState('modal', null);
    };

    const handleDeleteRequest = (member: TeamMember) => { setDeleteConfirmState({ isOpen: true, member: member }); };
    const handleConfirmDelete = async () => {
        const memberToDelete = deleteConfirmState.member; 
        if (!memberToDelete || !currentUser) return;
        
        setIsConfirmingDelete(true);
        const toastId = toast.loading('Wird gelöscht...');
        try {
            const { error: deleteError } = await supabase
                .from('team_members')
                .delete()
                .eq('id', memberToDelete.id)
                .eq('user_id', currentUser.id);
            if (deleteError) throw deleteError;

            if (memberToDelete.avatar_storage_path) {
                await supabase.storage.from('team-avatars').remove([memberToDelete.avatar_storage_path]);
            }

            toast.success("Mitglied gelöscht!", { id: toastId });
            setTeamMembers((prev: TeamMember[]) => prev.filter((t: TeamMember) => t.id !== memberToDelete.id));
        } catch (err: any) {
            toast.error(`Löschen fehlgeschlagen: ${err.message}`, { id: toastId });
        }
        setIsConfirmingDelete(false);
        setDeleteConfirmState({ isOpen: false, member: null });
    };
    const handleCancelDelete = () => { setDeleteConfirmState({ isOpen: false, member: null }); };

    const totalMembers = teamMembers.length;
    const distinctRoles = new Set(teamMembers.map((member) => member.role).filter(Boolean)).size;
    const membersWithBio = teamMembers.filter((member) => (member.bio ?? '').trim().length > 0).length;
    const bioCoverage = totalMembers ? Math.round((membersWithBio / totalMembers) * 100) : 0;

    return (
        <main className="space-y-10 px-6 py-10 lg:px-10">
            <DashboardHero
                eyebrow="Team"
                title="Ihr Unternehmen erlebbar machen"
                subtitle="Präsentieren Sie Ihr Team, stellen Sie Expertise heraus und schaffen Sie Vertrauen bei neuen Kundinnen und Kunden."
                actions={[
                    {
                        label: 'Neues Mitglied',
                        icon: PlusIcon,
                        onClick: openAddModal,
                    },
                ]}
            >
                <div className="grid gap-4 md:grid-cols-3">
                    <DashboardStatCard
                        title="Teammitglieder"
                        value={totalMembers}
                        description="Aktiv in der Übersicht"
                        icon={UserGroupIcon}
                        trend={totalMembers > 0 ? `${totalMembers} Personen sichtbar` : 'Fügen Sie Ihr erstes Mitglied hinzu'}
                    />
                    <DashboardStatCard
                        title="Unterschiedliche Rollen"
                        value={distinctRoles}
                        description="Verfügbare Expertisen"
                        icon={PencilIcon}
                        accent="indigo"
                        trend={distinctRoles > 0 ? 'Vielfältiges Team' : 'Rollen noch nicht gepflegt'}
                    />
                    <DashboardStatCard
                        title="Bio-Abdeckung"
                        value={`${bioCoverage}%`}
                        description="Mit kurzer Vorstellung"
                        icon={CheckCircleIcon}
                        accent="emerald"
                        trend={
                            totalMembers === 0
                                ? 'Beginnen Sie mit einer Vorstellung'
                                : bioCoverage === 100
                                ? 'Alle Profile vollständig'
                                : `${membersWithBio}/${totalMembers} mit Bio`
                        }
                    />
                </div>
            </DashboardHero>

            {loading && (<div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-10 text-center text-sm text-slate-300">Lade Team-Mitglieder...</div>)}
            {error && !loading && (<div className="rounded-2xl border border-red-500/40 bg-red-900/30 p-6 text-center text-sm text-red-100">{error}</div>)}

            {!loading && (
                <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <div className="space-y-4">
                        {teamMembers.length > 0 ? (
                            teamMembers.map((member: TeamMember) => {
                                const isLoading = !!actionLoading[member.id];
                                const isDisabled = isLoading || actionLoading.modal === 'save' || (deleteConfirmState.member?.id === member.id && isConfirmingDelete);
                                return (
                                    <div
                                        key={member.id}
                                        className={`flex items-center justify-between rounded-2xl border border-slate-700/70 bg-slate-800/70 p-4 transition hover:-translate-y-0.5 hover:border-orange-500/60 hover:bg-slate-800/90 ${isDisabled ? 'opacity-70 pointer-events-none' : ''}`}
                                    >
                                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                                            <img
                                                src={
                                                    member.avatar_url ||
                                                    `https://placehold.co/64x64/475569/94a3b8?text=${encodeURIComponent(member.name.charAt(0) || 'P')}`
                                                }
                                                alt={member.name}
                                                className="h-14 w-14 flex-shrink-0 rounded-full object-cover"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-white truncate">{member.name}</p>
                                                <p className="text-sm text-slate-400 truncate">{member.role || 'Keine Position'}</p>
                                                {member.bio && <p className="mt-1 line-clamp-2 text-sm text-slate-400">{member.bio}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0 pl-4">
                                            <span className="text-xs text-slate-500" title="Sortier-Reihenfolge">
                                                #{member.display_order}
                                            </span>
                                            <button
                                                onClick={() => openEditModal(member)}
                                                disabled={!!isDisabled}
                                                title="Bearbeiten"
                                                className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                                                    isDisabled
                                                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                        : 'bg-blue-600/20 text-blue-300 hover:bg-blue-500/30'
                                                }`}
                                            >
                                                <span className="sr-only">Bearbeiten</span>
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRequest(member)}
                                                disabled={!!isDisabled || actionLoading[member.id] === 'delete'}
                                                title="Löschen"
                                                className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                                                    actionLoading[member.id] === 'delete'
                                                        ? 'bg-slate-600 text-slate-400 cursor-wait'
                                                        : isDisabled
                                                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                        : 'bg-red-600/20 text-red-300 hover:bg-red-500/30'
                                                }`}
                                            >
                                                <span className="sr-only">Löschen</span>
                                                {actionLoading[member.id] === 'delete' ? <ArrowPathIcon className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            !error && (
                                <EmptyState
                                    icon={UserGroupIcon}
                                    title="Noch keine Team-Mitglieder"
                                    message="Fügen Sie sich selbst und Ihre Mitarbeiter hinzu, um Vertrauen auf Ihrer öffentlichen Webseite aufzubauen."
                                    buttonText="Erstes Mitglied hinzufügen"
                                    onButtonClick={openAddModal}
                                />
                            )
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/60">
                            <div className="border-b border-slate-800/70 bg-gradient-to-r from-slate-900 via-slate-900/60 to-orange-900/30 px-5 py-4">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Storytelling-Tipps</h2>
                            </div>
                            <div className="space-y-3 px-5 py-4 text-sm text-slate-300">
                                <p>Schreiben Sie kurze Bios, die Fachgebiete und persönliche Highlights kombinieren – so wirkt Ihr Team nahbar.</p>
                                <p>Nutzen Sie hochwertige Porträts oder Arbeitsfotos mit identischem Hintergrund, um einen einheitlichen Eindruck zu schaffen.</p>
                                <p>Positionieren Sie Ihr wichtigstes Teammitglied an erster Stelle durch die Sortier-Reihenfolge.</p>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5 text-sm text-slate-300">
                            <h3 className="text-base font-semibold text-white">Mehr Vertrauen aufbauen</h3>
                            <p className="mt-2 text-sm text-slate-400">
                                Ergänzen Sie Ihre Teamseite mit Testimonials und Projektlinks, damit Besucher direkt sehen, welche Qualität sie erwartet.
                            </p>
                            <button
                                onClick={() => router.push('/dashboard/testimonials')}
                                className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-900/40 transition hover:bg-orange-400"
                            >
                                Kundenstimmen hinzufügen
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <TeamMemberModal modalState={modalState} onClose={closeModal} onSave={handleSaveMember} isSaving={actionLoading.modal === 'save'} />
            <ConfirmationModal isOpen={deleteConfirmState.isOpen} title="Mitglied löschen" message={`Möchten Sie "${deleteConfirmState.member?.name || ''}" wirklich unwiderruflich löschen?`} confirmText="Ja, löschen" onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} isConfirming={isConfirmingDelete} />
        </main>
    );
}