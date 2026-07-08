import ChatInterface from '@/components/ChatInterface';

export default function ChatPage({ params }: { params: { id: string } }) {
  return (
    <main className="h-screen flex flex-col">
      <div className="bg-white shadow p-4">
        <h1 className="text-xl font-bold">ProdCoach</h1>
      </div>
      <ChatInterface sessionId={params.id} />
    </main>
  );
}
