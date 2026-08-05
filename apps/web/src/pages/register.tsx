import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  SearchableDropdown,
} from "@raffle_v2/ui";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { useSchools } from "../hooks/use-schools";
import { api } from "../lib/api-client";
import { signUp } from "../lib/auth-client";

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 300);

  // Rename isLoading to avoid button confusion
  const { data: schoolsData, isLoading: isSchoolsLoading } = useSchools({
    page: 1,
    pageSize: 100,
    search,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Sign up the user
      const results = await signUp.email({ name, email, password });

      // 2. If sign up successful and school selected, update school
      if (results.data?.user.id && schoolId) {
        const response = await api.user.school.$patch({
          json: { school_id: schoolId },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update school");
        }
      }

      // 3. Navigate on success
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Register a Coach Account</CardTitle>
        <CardDescription>Get started with Deped Raffle System 2026</CardDescription>
        <CardDescription>DepEd - Division of Cagayan de Oro City</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="school">School</Label>
            <SearchableDropdown
              options={schoolsData?.data ?? []}
              value={schoolId}
              onChange={setSchoolId}
              placeholder="Select a school"
              searchPlaceholder="Search schools..."
              search={search}
              setSearch={setSearchInput}
              loading={isSchoolsLoading}
              serverSide={true}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" isLoading={isLoading} className="mt-2">
            Create account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

