import { useState, useEffect } from "react";
import { Schedule } from "./useSchedules";
import { useAuth } from "./useAuth";
import { sendEmail, createEmailTemplate } from "@/lib/email";

export function useNotifications() {
  const [enabled, setEnabled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if email notifications are enabled in localStorage
    const emailNotifications = localStorage.getItem("email_notifications");
    setEnabled(emailNotifications === "true");
  }, []);

  const enableEmailNotifications = () => {
    localStorage.setItem("email_notifications", "true");
    setEnabled(true);
  };

  const disableEmailNotifications = () => {
    localStorage.setItem("email_notifications", "false");
    setEnabled(false);
  };

  const sendEmailNotification = async (
    schedule: Schedule,
    type: "upcoming" | "start" | "reminder"
  ) => {
    if (!enabled || !user?.email) return false;

    const now = new Date();
    const startTime = new Date(schedule.start_time);
    const timeUntilStart = startTime.getTime() - now.getTime();
    const minutesUntilStart = Math.floor(timeUntilStart / (1000 * 60));

    const scheduleTime = startTime.toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const { subject, html } = createEmailTemplate(
      type,
      schedule.title,
      scheduleTime,
      schedule.description,
      user.email
    );

    try {
      const success = await sendEmail({
        to: user.email,
        subject,
        html,
        scheduleTitle: schedule.title,
        scheduleTime,
        type,
      });

      if (success) {
        console.log(
          `📧 Email notification sent successfully: ${type} for ${schedule.title}`
        );
      } else {
        console.error(
          `❌ Failed to send email notification: ${type} for ${schedule.title}`
        );
      }

      return success;
    } catch (error) {
      console.error("Error sending email notification:", error);
      return false;
    }
  };

  const scheduleEmailNotifications = (schedule: Schedule) => {
    if (!enabled || !user?.email) return;

    const now = new Date();
    const startTime = new Date(schedule.start_time);
    const timeUntilStart = startTime.getTime() - now.getTime();

    // Don't schedule if the event has already started
    if (timeUntilStart <= 0) return;

    const minutesUntilStart = Math.floor(timeUntilStart / (1000 * 60));

    // Send reminder 15 minutes before
    if (minutesUntilStart > 15) {
      const reminderTime = timeUntilStart - 15 * 60 * 1000;
      setTimeout(() => {
        sendEmailNotification(schedule, "reminder");
      }, reminderTime);
    }

    // Send notification 5 minutes before
    if (minutesUntilStart > 5) {
      const upcomingTime = timeUntilStart - 5 * 60 * 1000;
      setTimeout(() => {
        sendEmailNotification(schedule, "upcoming");
      }, upcomingTime);
    }

    // Send notification when it starts
    setTimeout(() => {
      sendEmailNotification(schedule, "start");
    }, timeUntilStart);
  };

  const sendImmediateEmailNotification = async (
    schedule: Schedule,
    type: "upcoming" | "start" | "reminder"
  ) => {
    return await sendEmailNotification(schedule, type);
  };

  return {
    enabled,
    enableEmailNotifications,
    disableEmailNotifications,
    sendEmailNotification,
    scheduleEmailNotifications,
    sendImmediateEmailNotification,
  };
}
