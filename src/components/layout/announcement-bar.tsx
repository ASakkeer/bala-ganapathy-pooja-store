import { Container } from "@/components/ui/container";

export function AnnouncementBar({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="bg-brand text-on-brand">
      <Container>
        <p className="py-2.5 text-center text-sm tracking-wide">{message}</p>
      </Container>
    </div>
  );
}
