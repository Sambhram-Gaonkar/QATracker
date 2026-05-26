import type { Bug, Organization, Project, TestCase } from "./app";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Partial<Organization> & Pick<Organization, "name">;
        Update: Partial<Organization>;
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: "owner" | "admin" | "tester" | "viewer";
          created_at: string | null;
        };
        Insert: {
          organization_id: string;
          user_id: string;
          role?: "owner" | "admin" | "tester" | "viewer";
        };
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Row"]>;
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Project>;
        Relationships: [];
      };
      test_cases: {
        Row: TestCase;
        Insert: Omit<TestCase, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<TestCase>;
        Relationships: [];
      };
      bugs: {
        Row: Bug;
        Insert: Omit<Bug, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Bug>;
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
