import { Zoom, toast, ToastOptions } from "react-toastify";

const defaultConfigs: ToastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Zoom,
};

type IToastify = {
  type: 'error' | "success" | "warning" | "info";
  message: string 
}

export const Toastify = ({type, message} : IToastify) => {
  switch (type) {
    case "error":
      return toast.error(message, defaultConfigs);

    case "success":
      return toast.success(message, defaultConfigs);

    case "warning":
      return toast.warning(message, defaultConfigs);
      
    case "info":
      return toast.info(message, defaultConfigs);
  }
};
