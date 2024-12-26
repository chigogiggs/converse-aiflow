import { PageLayout } from "@/components/PageLayout";

const Home = () => {
  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-4xl font-bold">Welcome Home</h1>
        <p className="text-muted-foreground">This is your home page</p>
      </div>
    </PageLayout>
  );
};

export default Home;