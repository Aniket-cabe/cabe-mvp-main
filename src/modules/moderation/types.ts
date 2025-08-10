export type ModerationType = 'review_pending' | 'suspicious' | 'rejected';

export interface ModerationState {
  type: ModerationType;
  message: string;
  icon: string;
  color: string;
  canClose: boolean;
  showAppeal: boolean;
  timeout?: number;
}

export interface ModerationModalProps {
  isOpen: boolean;
  type: ModerationType;
  onClose: () => void;
  onAppeal?: () => void;
}

export interface UseModerationReturn {
  isOpen: boolean;
  type: ModerationType | null;
  openModal: (type: ModerationType) => void;
  closeModal: () => void;
  triggerRandomModeration: () => void;
}

export interface AppealFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export interface WebSocketMock {
  on: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
  disconnect: () => void;
}
