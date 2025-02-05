import { PageLayout } from "@/components/PageLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";

const Chat = () => {
  return (
    <PageLayout showBackButton={false} showFooter={false}>
      <div className="h-[calc(100vh-4rem)]">
        <ChatContainer />
      </div>
    </PageLayout>
  );
};

export default Chat;