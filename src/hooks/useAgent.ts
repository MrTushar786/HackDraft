import { useState, useEffect } from "react";
import type { HackathonInput, ProjectIdea, AgentResponse } from "../types";
import { buildSystemPrompt, buildUserPrompt, buildRefinePrompt } from "../utils/promptBuilder";

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

  const updateIdea = (updatedIdea: ProjectIdea) => {
    setIdeas(prev => prev.map(i => i.id === updatedIdea.id ? updatedIdea : i));
  };

  const generateIdeas = async (input: HackathonInput) => {
    setLoading(true);
    setError(null);
    try {
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
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong. Check API Key?");
    } finally {
      setLoading(false);
    }
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

  return { loading, ideas, error, generateIdeas, refineIdea, clearIdeas, updateIdea };
};
