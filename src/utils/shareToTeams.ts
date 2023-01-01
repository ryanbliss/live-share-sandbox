import { sharing } from "@microsoft/teams-js";

export const shareToTeams = async (
  shareUrl: string,
  shareMessage?: string
): Promise<void> => {
  try {
    await sharing.shareWebContent({
      content: [
        {
          type: "URL",
          url: shareUrl,
          message: shareMessage,
          preview: true,
        },
      ],
    });
  } catch (error: any) {
    throw error;
  }
};
