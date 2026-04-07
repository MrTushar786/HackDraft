import { useState, useEffect } from "react";
import type { HackathonInput, ProjectIdea, AgentResponse } from "../types";
import { buildSystemPrompt, buildUserPrompt, buildRefinePrompt } from "../utils/promptBuilder";
import { supabase } from "../lib/supabase";

export const useAgent = () => {
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ProjectIdea[]>(() => {
    const saved = localStorage.getItem('hackdraft_ideas');
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('hackdraft_ideas', JSON.stringify(ideas));
  }, [ideas]);

  const clearIdeas = () => {
    setIdeas([]);
    localStorage.removeItem('hackdraft_ideas');
  };

  const syncProjectsToDB = async (newIdeas: ProjectIdea[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const projectsToInsert = newIdeas.map(idea => ({
        user_id: user.id,
        project_data: idea
      }));

      await supabase.from('user_projects').insert(projectsToInsert);
    } catch (err) {
      console.error('DB Sync Error:', err);
    }
  };

  const fetchHistoryFromDB = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('project_data')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(row => row.project_data as ProjectIdea);
    } catch (err) {
      console.error('Fetch Error:', err);
      return [];
    }
  };

  const updateIdea = (updatedIdea: ProjectIdea) => {
    setIdeas(prev => prev.map(i => i.id === updatedIdea.id ? updatedIdea : i));
  };

  const generateIdeas = async (input: HackathonInput) => {
    setLoading(true);
    setIdeas([]);
    setError(null);
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemPrompt: buildSystemPrompt(),
            userMessage: buildUserPrompt(input),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.details || data.error || "Server error occurred");
        }

        setIdeas(data.ideas);
        await syncProjectsToDB(data.ideas); // Save to DB!
        break; // Success, exit loop
      } catch (err: unknown) {
        console.error(`Generation attempt ${attempts} failed:`, err);
        if (attempts >= maxAttempts) {
          setError(err instanceof Error ? err.message : "Something went wrong. Check API Key?");
        }
      }
    }
    setLoading(false);
  };

  const refineIdea = async (idea: ProjectIdea, refinement: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: buildSystemPrompt(),
          userMessage: buildRefinePrompt(idea.name, refinement),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Server error occurred");
      }

      const updatedIdea = data.ideas[0];
      setIdeas(prev => prev.map(i => i.id === idea.id ? { ...updatedIdea, id: idea.id } : i));
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, ideas, error, generateIdeas, refineIdea, clearIdeas, updateIdea, fetchHistoryFromDB };
};
