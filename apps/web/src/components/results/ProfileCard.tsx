import type { ProfileDocument } from '@repo/api-types';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { truncate } from '@/lib/truncate';

interface ProfileCardProps {
  profile: ProfileDocument;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const summary = truncate(profile.summary);

  return (
    <Card
      className="[content-visibility:auto] [contain-intrinsic-size:0_140px]"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-base">{profile.fullName}</CardTitle>
          {profile.industry ? (
            <Badge variant="secondary">{profile.industry}</Badge>
          ) : null}
        </div>
        <CardDescription>
          {[profile.jobTitle, profile.jobCompanyName]
            .filter(Boolean)
            .join(' · ')}
        </CardDescription>
      </CardHeader>
      {summary ? (
        <CardContent className="pt-0">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}
