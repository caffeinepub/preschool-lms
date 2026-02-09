import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  FormDefinition,
  FormField,
  DropdownOption,
  EntityRecord,
  ReportDefinition,
  ImportStatus,
  UserRole,
} from '../backend';
import { toast } from 'sonner';

// User Profile Types
export interface UserProfile {
  name: string;
  role: UserRole;
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const role = await actor.getCallerUserRole();
      // For now, we'll use a simple profile structure
      // In a real app, you'd have a separate profile storage
      return { name: 'Admin User', role };
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      // Profile is saved implicitly through authentication
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// Admin Check
export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Form Management
export function useGetAllForms() {
  const { actor, isFetching } = useActor();

  return useQuery<FormDefinition[]>({
    queryKey: ['forms'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllForms();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetForm(formName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<FormDefinition | null>({
    queryKey: ['form', formName],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getForm(formName);
    },
    enabled: !!actor && !isFetching && !!formName,
  });
}

export function useCreateForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: FormDefinition) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createForm(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast.success('Form created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create form: ${error.message}`);
    },
  });
}

// Dropdown Management
export function useGetDropdownOptions(dropdownName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<DropdownOption[]>({
    queryKey: ['dropdownOptions', dropdownName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDropdownOptions(dropdownName);
    },
    enabled: !!actor && !isFetching && !!dropdownName,
  });
}

export function useAddDropdownOption() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dropdownName, option }: { dropdownName: string; option: DropdownOption }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addDropdownOption(dropdownName, option);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dropdownOptions', variables.dropdownName] });
      toast.success('Option added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add option: ${error.message}`);
    },
  });
}

// Entity Management
export function useGetEntities(formName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<EntityRecord[]>({
    queryKey: ['entities', formName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEntities(formName);
    },
    enabled: !!actor && !isFetching && !!formName,
  });
}

export function useCreateEntity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formName, data }: { formName: string; data: [string, string][] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEntity(formName, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entities', variables.formName] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create record: ${error.message}`);
    },
  });
}

// Report Management
export function useGetAllReports() {
  const { actor, isFetching } = useActor();

  return useQuery<ReportDefinition[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReports();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: ReportDefinition) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createReport(report);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create report: ${error.message}`);
    },
  });
}

// Import Status
export function useGetImportStatus(formName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ImportStatus | null>({
    queryKey: ['importStatus', formName],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getImportStatus(formName);
    },
    enabled: !!actor && !isFetching && !!formName,
  });
}

export function useUpdateImportStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formName, status }: { formName: string; status: ImportStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateImportStatus(formName, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['importStatus', variables.formName] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update import status: ${error.message}`);
    },
  });
}
