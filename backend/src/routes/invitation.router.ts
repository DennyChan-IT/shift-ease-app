import { Router } from 'express';
import { createInvitation, listInvitations } from '../controllers/invitationcontroller';

export const router = Router();

router.post('/', createInvitation);
router.get('/', listInvitations);