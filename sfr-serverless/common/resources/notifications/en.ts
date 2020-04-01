import { NotificationKeyType } from "./types";

export default {
  [NotificationKeyType.SentFriendRequest]: {
    title: "has sent you friend request"
  },
  [NotificationKeyType.AcceptedFriendRequest]: {
    title: "has accepted your friend request"
  },
  [NotificationKeyType.MatchPlay]: {
    title: "has invited you to play"
  },
  [NotificationKeyType.MatchPlayAccepted]: {
    title: "has accepted your invitation to play"
  },
  [NotificationKeyType.MatchPlayDeclined]: {
    title: "has declined your invitation to play"
  },
  [NotificationKeyType.MatchPlayRequested]: {
    title: "has requested to play"
  },
  [NotificationKeyType.MatchPlayRequestAccepted]: {
    title: "has accepted your request to play"
  },
  [NotificationKeyType.MatchPlayRequestDeclined]: {
    title: "has declined your request to play"
  },
  [NotificationKeyType.UploadScoreCard]: {
    title: "has uploaded the score card. Please review and accept the scores"
  },
  [NotificationKeyType.PlayerScoreCardUploaded]: {
    title: "has uploaded the player score. Please review and accept the scores for the player"
  },
  [NotificationKeyType.TeamScoreCardUploaded]: {
    title: "has uploaded the team score. Please review and accept the scores for the team"
  },
  [NotificationKeyType.MatchResultDeclared]: {
    title: "has declared the results for match"
  },
  [NotificationKeyType.MatchStarted]: {
    title: "has started the match"
  },
  [NotificationKeyType.MatchFinished]: {
    title: "has ended the match"
  },
  [NotificationKeyType.MatchApproved]: {
    title: "has approved the match"
  }
  
};
