import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">ProdCoach</h1>
        <p className="text-gray-600 mb-6 text-center">Connectez-vous pour démarrer un coaching.</p>
        <AuthForm />
      </div>
    </main>
  );
}
