// src/hooks/useNotifications.js
import { useContext } from 'react';
import NotificationContext from '../context/NotificationContext';

export const useNotifications = () => useContext(NotificationContext);
