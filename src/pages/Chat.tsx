import { PageLayout } from "@/components/PageLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";

const Chat = () => {
  return (
    <PageLayout showBackButton={false} showFooter={false}>
      <div className="h-screen">
        <ChatContainer />
      </div>
    </PageLayout>
  );
};

export default Chat;