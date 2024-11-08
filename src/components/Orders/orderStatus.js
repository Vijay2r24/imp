
import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
} from "@mui/material";
import { GrInProgress } from "react-icons/gr";

import { FaUpload, FaEdit, FaTrashAlt } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { AiOutlineEye } from "react-icons/ai";
import { FiDownload } from "react-icons/fi";
import StatusBadge from "./Statuses"; // Make sure you have this component
import Step2 from "./payment";
import { useNavigate } from "react-router-dom";
import {
  CREATEORUPDATE_ORDER_HISTORY__API,
  GET_ALL_HYSTORYID_API,
  GETALLUSERS_API,
  GETALLROLESS_API,
  ORDER_STATUS_API,
  ORDERBYCUSTOMERID_API,
} from "../../Constants/apiRoutes";
import LoadingAnimation from "../Loading/LoadingAnimation";
import { IdContext } from "../../Context/IdContext";
import { GETORDERBYID_API } from "../../Constants/apiRoutes";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import {
  StyledTableCell,
  StyledTableRow,
  TablePaginationActions,
} from "../CustomTablePagination";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineCancel } from "react-icons/md";
import Typography from "@mui/material/Typography";

import { OrderContext } from "../../Context/orderContext";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { IoIosSearch } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import { FaRegUserCircle } from "react-icons/fa";

import { useUpdatedStatusOrderContext } from "../../Context/UpdatedOrder";
// import { useFormData } from "../../Context/statusFormContext";

const YourComponent = ({ onBack, onNext, orderId }) => {
  // Define state for orders, images, pdfPreview, errors, etc.

  // const { orderIdDetails } = useContext(OrderContext);
  const location = useLocation();

  // Get orderId from either location state or context
  // const { orderId } = location.state || {};
  const OrderID = orderId;
  // const OrderID = orderId || orderIdDetails?.order?.OrderID;

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [images, setImages] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [totalRecords, setTotalRecords] = useState("");
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // Error state
  const [pdfPreviews, setPdfPreviews] = useState([]);
  const [docPreviews, setDocPreviews] = useState([]);
  {
    activeStep === 2 && <Step2 />;
  }
  const {
    generatedId,
    customerId,
    orderDate,
    designerName,
    setDesignerName,
    desginerID,
    setDesginerID,
    statusID,
    setStatusID,
    setcCustomerId,
    setRoleID,
    roleID,
  } = useContext(IdContext);
  const [orderStatusList, setOrderStatusList] = useState([]);
  const [results, setResults] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredRolesList, setFilteredRolesList] = useState([]);
  const [searchUserValue, setSearchUserValue] = useState(designerName || "");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState(roleID || "");
  const { updatedStatusOrderDetails, setUpdatedStatusOrderDetails } =
    useUpdatedStatusOrderContext();
  const [formOrderDetails, setFormOrderDetails] = useState({
    OrderStatus: "",
    ExpectedDays: "",
    DeliveryDate: "",
    Comments: "",
    AssignTo: desginerID,
    RoleID: roleID,
    UploadDocument: "",
    StartDate: new Date().toISOString().split("T")[0], // Set StartDate to today's date in YYYY-MM-DD format
  });

  useEffect(() => {
    const fetchOrderStatuses = async () => {
      try {
        const response = await fetch(ORDER_STATUS_API);
        const data = await response.json();

        // Log the data to see its structure

        // Check if data is in the expected format
        if (Array.isArray(data.data)) {
          setOrderStatusList(data.data);
        }
      } catch (error) {
        console.error("Error fetching order statuses:", error);
      }
    };

    fetchOrderStatuses();
  }, []);

  const handleChanging = (statusID) => {
    // Find the index of the selected status in the filteredStatusList
    const selectedStepIndex = filteredStatusList.findIndex(
      (status) => status.StatusID === statusID
    );

    // Create a new object for completed steps
    const newCompletedSteps = {};

    // Mark the current step and all previous steps as completed (ticked)
    for (let i = 0; i <= selectedStepIndex; i++) {
      newCompletedSteps[i] = true; // Mark steps as completed
    }

    // Unmark all steps after the selected one (untick)
    for (let i = selectedStepIndex + 1; i < filteredStatusList.length; i++) {
      newCompletedSteps[i] = false; // Set false to untick remaining steps
    }

    // Update the state with the new completed steps and set the active step
    setCompletedSteps(newCompletedSteps);
    setActiveStep(selectedStepIndex); // Set the active step to the selected one
    setSelectedStatus(statusID); // Update the selected status
  };

  useEffect(() => {
    if (selectedCustomer?.CustomerID) {
      // Fetch orders for the selected customer
      fetchOrdersByCustomerId(selectedCustomer.CustomerID);
    }
  }, [selectedCustomer]);
  // Fetch orders based on selected customer ID
  const fetchOrdersByCustomerId = async (customerId) => {
    try {
      if (!customerId) return; // Ensure customerId exists
      const response = await axios.get(
        `${ORDERBYCUSTOMERID_API}/${customerId}`
      );
      setOrders(response.data.orders || []); // Set fetched orders
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders.");
    }
  };
  // Close the modal and move to the next step after a delay
  const [orderDetails, setOrderDetails] = useState({
    Type: "",
    StoreCode: "",
    TenantID: 1,
    CustomerID: selectedCustomer.CustomerID,
    OrderDate: "",
    TotalQuantity: 1,
    AddressID: selectedAddress.AddressID,
    TotalAmount: "",
    OrderStatus: "",
    TotalQuantity: 1,
    OrderBy: "",
    DeliveryDate: "",
    DeliveryDate: "",
    Comments: "",
    ReferedBy: "",
    PaymentComments: "",
    assginto: "",
    AdvanceAmount: "",
    BalanceAmount: "",
    ExpectedDurationDays: "",
    DesginerName: "",
    UserID: "",
    AssainTo: desginerID,
    // UploadImages: "",
    // choosefiles: "",
    StoreID: selectedCustomer.StoreID || "",
  });

  const saveOrderHistory = async () => {
    const {
      StatusID,
      OrderStatus,
      DeliveryDate,
      Comments,
      AssignTo,
      RoleID,
      UserID,
      OrderHistoryID,
    } = formOrderDetails;

    // Validate required fields
    if (!DeliveryDate) {
      toast.error("Delivery date is required.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const userId = localStorage.getItem("UserID");

    // Create a new FormData object
    const formData = new FormData();
    formData.append("TenantID", 1);
    formData.append(
      "OrderHistoryID",
      editMode ? formOrderDetails.OrderHistoryID : 0
    ); // Use existing ID for updates
    formData.append("OrderID", OrderID);
    formData.append("StartDate", orderDate);
    formData.append("EndDate", DeliveryDate);
    formData.append("AssignTo", desginerID);
    formData.append("Comments", Comments);
    formData.append("UserID", userId);
    formData.append("UserRoleID", RoleID);
    formData.append("CreatedBy", "sandy");
    formData.append("OrderStatus", selectedStatus || "N/A");

    const selectedOrderStatus = orderStatusList.find(
      (status) => status.StatusID === selectedStatus
    );
    formData.append("StatusID", selectedStatus || 1);
    formData.append("OrderStatus", selectedOrderStatus?.OrderStatus || "N/A");

    if (images && images.length > 0) {
      images.forEach((fileData, index) => {
        const { data, name, type } = fileData;
        const blob = new Blob([data], { type });
        formData.append("UploadDocument", blob, name);
      });
    }
    setIsLoading(true);
    try {
      // API request to create or update order history
      const response = await fetch(CREATEORUPDATE_ORDER_HISTORY__API, {
        method: "POST",
        body: formData,
      });

      const data = await response.json(); // Parse the JSON response

      if (data.StatusCode === "FAILURE" || data.error) {
        // Show the error message from the API response's `error` field
        toast.error(
          data.error || "Error occurred while processing the request.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
        return;
      }

      // Show success message from the API response
      toast.success(data.message || "Order history created successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      const updatedCustomer = await fetchOrderDetails(OrderID);

      fetch(`${GETORDERBYID_API}/${OrderID}`)
        .then((response) => response.json())
        .then((data) => {
          if (data?.order) {
            setOrderDetails(data.order);
            setUpdatedStatusOrderDetails(data.order);
          }
        })
        .catch((error) => {
          toast.error("Failed to fetch the order details!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        });

      closeModalAndMoveToNextStep();
      setSelectedStatus("");
      setImagePreviews([]);
      setImages([]);
      setPdfPreviews([]);
      setDocPreviews([]);
      setEditMode(false);
      setFormOrderDetails({
        ...formOrderDetails, // Preserve other fields
        DeliveryDate: "", // Clear Delivery Date
        Comments: "",
        ExpectedDays: "", // Clear Comments
      });
    } catch (error) {
      // Show the actual error message from the try-catch block
      toast.error(error.message || "An unexpected error occurred.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsLoading(false); // Hide loader when done
    }
  };
  useEffect(() => {
    // Log the updated order details or perform any side effects here
  }, [updatedStatusOrderDetails]);
  const closeModalAndMoveToNextStep = () => {
    setTimeout(() => {
      setShowModal(false);
      // onNext();
    }, 3000); // Delay of 4 seconds
  };

  // Close the modal after a delay (for error cases)
  const closeModalAfterDelay = () => {
    setTimeout(() => {
      setShowModal(false); // Close the modal after a delay
    }, 3000); // Delay of 4 seconds
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormOrderDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handledate = (e) => {
    const { name, value } = e.target;
    setFormOrderDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, [name]: value };
      if (name === "ExpectedDurationDays") {
        const days = parseInt(value, 10);
        if (!isNaN(days) && days >= 0) {
          const today = new Date();
          updatedDetails.DeliveryDate = addDays(today, days);
        } else {
          updatedDetails.DeliveryDate = ""; // Reset if invalid
        }
      }
      return updatedDetails;
    });
  };

  const formatDate = (date) => {
    if (!date) return ""; // If the date is null or undefined, return an empty string.
    const validDate = new Date(date);
    return !isNaN(validDate.getTime())
      ? validDate.toISOString().split("T")[0] // Return formatted date
      : ""; // Return empty string if the date is invalid
  };

  const handleExpectedDaysChange = (e) => {
    const expectedDays = parseInt(e.target.value, 10);

    // Validate input
    if (isNaN(expectedDays) || expectedDays < 1) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        ExpectedDays: "Please enter a valid number of days.",
      }));
      return;
    }

    // Clear any errors
    setErrors((prevErrors) => ({
      ...prevErrors,
      ExpectedDays: "",
    }));

    // Calculate the delivery date based on StartDate
    const deliveryDate = calculateExpectedDeliveryDate(
      formOrderDetails.StartDate,
      expectedDays
    );

    // Update form state with expected days and delivery date
    setFormOrderDetails((prevDetails) => ({
      ...prevDetails,
      ExpectedDays: expectedDays,
      DeliveryDate: deliveryDate, // This will now correctly update
    }));
  };
  // Utility function to calculate the delivery date based on StartDate and ExpectedDays
  const calculateExpectedDeliveryDate = (startDate, daysToAdd) => {
    if (!startDate || isNaN(new Date(startDate))) {
      return ""; // Return an empty string if the startDate is invalid
    }
    const date = new Date(startDate);
    date.setDate(date.getDate() + daysToAdd); // Add the number of days
    return formatDate(date); // Return in YYYY-MM-DD format
  };

  // Handler for manual changes in the Delivery Date input (if needed)
  const handleDateChanging = (e) => {
    const { value } = e.target;
    const newDate = new Date(value);

    if (isNaN(newDate)) {
      setFormOrderDetails((prevDetails) => ({
        ...prevDetails,
        DeliveryDate: "", // Reset if invalid
      }));
    } else {
      setFormOrderDetails((prevDetails) => ({
        ...prevDetails,
        DeliveryDate: newDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
      }));
    }
  };
  const handleFileChange = (event) => {
    const files = event.target.files; // Get the FileList object from the input
    const selectedFiles = Array.from(files); // Convert the FileList to an array


    const UploadDocuments = {}; // Object to store document names
    const previews = []; // Array to store image previews
    const pdfPreviews = []; // Array to store PDF previews
    const docPreviews = []; // Array to store other document previews
    const binaryFiles = []; // Array to store binary files for all file types

    // Create an array of promises for reading each file asynchronously
    const fileReadPromises = selectedFiles.map((file, index) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // Handle file load event
        reader.onload = () => {
          const binaryData = reader.result; // Get binary data

          // Create a preview URL for images or PDFs
          if (file.type.startsWith("image/")) {
            const previewUrl = URL.createObjectURL(file);
            previews.push(previewUrl); // Add image preview URL
          }

          if (file.type === "application/pdf") {
            const pdfPreviewUrl = URL.createObjectURL(file);
            pdfPreviews.push(pdfPreviewUrl); // Add PDF preview URL
            console.log(`PDF preview generated for: ${file.name}`);
          }

          // Handle other document types
          if (
            file.type === "application/msword" || // .doc
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // .docx
            file.type === "text/plain" || // .txt
            file.type === "application/vnd.ms-excel" || // .xls
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // .xlsx
          ) {
            const docPreviewUrl = URL.createObjectURL(file);
            docPreviews.push({
              name: file.name,
              url: docPreviewUrl,
              type: file.type, // Store the file type for proper handling
            });
            console.log(`Document preview generated for: ${file.name}`);
          }

          // Store document names as key-value pairs
          UploadDocuments[`Document_${index + 1}`] = file.name;
          console.log(`Stored document name: ${file.name}`);

          // Add binary data to the array
          binaryFiles.push({
            name: file.name,
            type: file.type,
            data: binaryData, // Binary data for backend upload
          });


          resolve(); // Resolve the promise after the file is read
        };

        // Handle errors
        reader.onerror = () => {
          reject(new Error(`Error reading file: ${file.name}`));
        };

        // Read the file as ArrayBuffer
        reader.readAsArrayBuffer(file);
      });
    });

    // Wait for all file reads to complete before updating the state
    Promise.all(fileReadPromises)
      .then(() => {
        console.log("All files processed, updating state...");

        setImagePreviews(previews); // Set image previews in state
        setPdfPreviews(pdfPreviews); // Set PDF previews in state
        setDocPreviews(docPreviews); // Set document previews in state
        setImages(binaryFiles); // Store all binary files (any type)
        setFormOrderDetails((prev) => ({
          ...prev,
          UploadDocument: UploadDocuments, // Store document names
        }));

        console.log("State updated with document names and binary data");
      })
      .catch((error) => {
        console.error("Error processing files:", error);
      });
  };
  // useEffect(() => {
  //   return () => {
  //     // Ensure imagePreviews is an array before calling forEach
  //     if (Array.isArray(imagePreviews)) {
  //       imagePreviews.forEach((url) => URL.revokeObjectURL(url)); // Release object URLs created
  //     } else {
  //       console.error("imagePreviews is not an array:", imagePreviews);
  //     }
  //     // Ensure pdfPreviews is an array before calling forEach
  //     if (Array.isArray(pdfPreviews)) {
  //       pdfPreviews.forEach((url) => URL.revokeObjectURL(url)); // Release PDF preview URLs
  //     } else {
  //       console.error("pdfPreviews is not an array:", pdfPreviews);
  //     }
  //   };
  // }, [imagePreviews, pdfPreviews]);
  useEffect(() => {
    return () => {
      // Ensure imagePreviews is an array before calling forEach
      if (Array.isArray(imagePreviews)) {
        imagePreviews.forEach((url) => URL.revokeObjectURL(url)); // Release object URLs created
      }
      // Ensure pdfPreviews is an array before calling forEach
      if (Array.isArray(pdfPreviews)) {
        pdfPreviews.forEach((url) => URL.revokeObjectURL(url)); // Release PDF preview URLs
      }
      // Ensure docPreviews is an array before calling forEach
      if (Array.isArray(docPreviews)) {
        docPreviews.forEach((doc) => URL.revokeObjectURL(doc.url)); // Release document URLs
      }
    };
  }, [imagePreviews, pdfPreviews, docPreviews]);
  const handleImageRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handlePdfRemove = (index) => {
    const newPdfPreviews = pdfPreviews.filter((_, i) => i !== index);
    setPdfPreviews(newPdfPreviews); // Update PDF previews
  };

  const [file, setFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const handleDelete = () => {
    setFile(null);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const addDays = (date, days) => {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'
  };
  const handleCancel = () => {
    // Example: Reset form or navigate to a different page
    // If you want to navigate away from the form, for example:
    navigate("/Orders"); // This assumes you're using `react-router-dom` for navigation
  };
  const [selectedStatus, setSelectedStatus] = useState(
    formOrderDetails.StatusID || ""
  );
  const [query, setQuery] = useState("");

  const filteredStatusList =
    query === ""
      ? orderStatusList
      : orderStatusList.filter((status) =>
        status.OrderStatus.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (statusID) => {
    const selectedStatus = orderStatusList.find(
      (status) => status.StatusID === statusID
    );

    setFormOrderDetails({
      ...formOrderDetails,
      OrderStatus: selectedStatus ? selectedStatus.OrderStatus : "",
      StatusID: statusID,
    });
  };

  // Helper function to calculate the duration between two dates
  const calculateDurationDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // Difference in days
    return duration;
  };
  const [statusDetails, setStatusDetails] = useState([]);
  const [subStatusId, setSubStatusId] = useState("");
  const fetchOrderDetails = async () => {
    try {
      if (OrderID === "new") return;
      setIsLoading(true);
      const response = await fetch(`${GET_ALL_HYSTORYID_API}${OrderID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();

      const statuses = Array.isArray(result) ? result : [result];
      const totalRecords = statuses.length;
      setTotalRecords(totalRecords);
      // Map the result to statusDetails
      const mappedStatusDetails = statuses.map((status) => ({
        StatusID: status.StatusID || "N/A",
        OrderID: status.OrderID || "N/A",
        AssignTo: status.AssignTo || "N/A",
        // AssignTo:status.FirstName||"N/A",
        AssignTo: `${status.FirstName || "N/A"} ${status.LastName || ""}`,
        UserRoleID: status.RoleID || "N/A",
        RoleName: status.RoleName || "N/A",
        OrderStatus: status.OrderStatus || "0",
        SubStatusId: status.SubStatusId || "N/A",
        DeliveryDate: status.EndDate || "N/A",
        Comments: status.Comment || "N/A",
        OrderHistoryID: status.OrderHistoryID || "N/A",
        StartDate: status.StartDate || "N/A",
        ExpectedDays: status.ExpectedDurationDays || "N/A",
        DownloadDocuments:
          status.DownloadDocuments?.length > 0
            ? status.DownloadDocuments
            : "No Documents",
        viewdocuments:
          status.viewdocuments?.length > 0
            ? status.viewdocuments
            : "No Documents",
      }));

      setStatusDetails(mappedStatusDetails);


      const getSubStatusId = (statusDetails, status) => {
        const foundItem = statusDetails.find(item => item.StatusID === status.StatusID);
        return foundItem ? foundItem.SubStatusId ?? "" : "";
      };
      // Automatically set the active step based on the first record's status
      if (mappedStatusDetails.length > 0) {
        const firstRecordStatus = mappedStatusDetails[0].OrderStatus;
        updateStepperStatus(firstRecordStatus);
        const newSubStatusId = getSubStatusId(mappedStatusDetails, mappedStatusDetails[0]);
        setSubStatusId(newSubStatusId);
      }
    } catch (err) {
      setError(err.message);
      console.error("Fetch Error:", err.message); // Log fetch error
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update stepper based on order status
  const updateStepperStatus = (firstOrderStatus) => {
    // Example mapping order status to stepper step index
    const stepIndexMap = {
      "Quick Quote": 0,
      "Initial Design": 1,
      "Initial Measurements": 2,
      "Revised Design": 3, // You could adjust this for specific revision numbers like R1, R2, etc.
      "Final Measurement": 4,
      "Signup Document": 5,
      Production: 6,
      PDI: 7,
      Dispatch: 8, // If there are multiple dispatches, you can handle them accordingly
      Installation: 9,
      Completion: 10,
      Canceled: 11,
    };

    // Find the corresponding step index for the first record's OrderStatus
    const activeStepIndex = stepIndexMap[firstOrderStatus] ?? 0;

    // Set the active step and mark steps as completed up to the active step
    const newCompletedSteps = {};
    for (let i = 0; i <= activeStepIndex; i++) {
      newCompletedSteps[i] = true;
    }

    setCompletedSteps(newCompletedSteps);
    setActiveStep(activeStepIndex); // Set active step to the corresponding index
  };

  // Fetch order details on component mount

  useEffect(() => {
    fetchOrderDetails();
  }, [generatedId]);

  const [IsEditMode, setIsEditMode] = useState(false); // default is not in edit mode

  const handleEditstatus = (historyId, statusId) => {
    // Find the specific order status based on the selected historyId
    const statusData = statusDetails.find(
      (status) => status.OrderHistoryID === historyId
    );

    if (statusData) {
      // Set form order details with the data found from the backend
      setFormOrderDetails({
        OrderID: statusData.OrderID || "",
        OrderHistoryID: statusData.OrderHistoryID || "",
        OrderStatus: statusData.OrderStatus || "N/A",
        DeliveryDate: statusData.DeliveryDate || "",
        Comments: statusData.Comments || "",
        StartDate: statusData.StartDate || "",
        DownloadDocuments: statusData.DownloadDocuments || [],
        viewdocuments: statusData.viewdocuments || [],
        StatusID: statusId || "",
        AssignTo: statusData.AssignTo || "",
        AssignTo: desginerID || "",
        RoleID: statusData.UserRoleID || "", // Corrected key if needed
        RoleName: statusData.RoleName || "",
      });
      // Set the search user value for the input field
      console.log("DownloadDocuments", statusData.viewdocuments || [])
      //  setPdfPreviews(statusData.viewdocuments || []);
      const viewDocumentsArray = Array.isArray(statusData.viewdocuments) ? statusData.viewdocuments : [];
      if (viewDocumentsArray.length > 0) {
        // Filter URLs based on file extension, accounting for suffixes after the extension
        // const imageFiles = statusData.viewdocuments.filter(url =>
        //   /\.(jpg|jpeg|png|gif)(_[^.]*)?$/.test(url)
        // );
        const pdfFiles = statusData.viewdocuments.filter(url =>
          /\.pdf(_[^.]*)?$/.test(url)
        );
        const docFiles = statusData.viewdocuments.filter(url =>
          /\.(doc|docx|txt|xls|xlsx)(_[^.]*)?$/.test(url) ||
          url.includes("application/msword") ||
          url.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
          url.includes("text/plain") ||
          url.includes("application/vnd.ms-excel") ||
          url.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        );

        // // Set preview states
        // setImagePreviews(imageFiles);
        setImagePreviews(statusData.viewdocuments);
        setPdfPreviews(pdfFiles);
        setDocPreviews(docFiles);
      }
      setSearchUserValue(statusData.AssignTo || "");
      // Set the selected role for the combobox
      setSelectedRole(statusData.UserRoleID || "");
      setSubStatusId(statusData.SubStatusId)
      // Set the selected role for the combobox
      // Call setSelectedRole only once

      // Get the index of the current status in the list
      const selectedStepIndex = filteredStatusList.findIndex(
        (status) => status.StatusID === statusId
      );

      // Automatically tick steps based on the status coming from the backend
      const newCompletedSteps = {};
      for (let i = 0; i <= selectedStepIndex; i++) {
        newCompletedSteps[i] = true; // Mark previous steps as completed
      }

      // Untick steps after the current status
      for (let i = selectedStepIndex + 1; i < filteredStatusList.length; i++) {
        newCompletedSteps[i] = false;
      }
      // Update completed steps and active step
      setCompletedSteps(newCompletedSteps);
      setActiveStep(selectedStepIndex); // Set the active step to the current one
      setSelectedStatus(statusId); // Update the selected status ID

      // Enable edit mode
      setEditMode(true);
    } else {
      console.error(
        "No valid data found for the provided historyId:",
        historyId
      );
    }
  };
  const handleCancel2 = () => {
    setSelectedStatus("");
   setImagePreviews([]);
      setImages([]);
      setPdfPreviews([]);
      setDocPreviews([]);
      setEditMode(false);
    setFormOrderDetails({
      ...formOrderDetails, // Preserve other fields
      DeliveryDate: "", // Clear Delivery Date
      Comments: "",
      ExpectedDays: "", // Clear Comments
    });
  };

  useEffect(() => {
    console.log("FormOrderDetails updated:", formOrderDetails);
  }, [formOrderDetails]);

  const selectedStatusText =
    orderStatusList.find((status) => status.StatusID === selectedStatus)
      ?.OrderStatus || "";

  useEffect(() => {
    console.log("Selected Status Updated:", selectedStatusText);
  }, [selectedStatus]);
  const [visibleSteps, setVisibleSteps] = useState(5); // Initially show 5 steps
  const [completedSteps, setCompletedSteps] = useState({});
  // const [activeStep, setActiveStep] = useState(null);

  const handleCompleteStep = (statusID) => {
    const newCompletedSteps = { ...completedSteps };
    // Mark the selected StatusID and all previous steps as completed
    filteredStatusList.forEach((status) => {
      if (status.StatusID <= statusID) {
        newCompletedSteps[status.StatusID] = true;
      }
    });
    setCompletedSteps(newCompletedSteps);
    setActiveStep(statusID); // Set the current StatusID as active
  };

  const handleStepClick = (statusID) => {
    handleCompleteStep(statusID); // Complete the step and all before it
    const currentIndex = filteredStatusList.findIndex(
      (status) => status.StatusID === statusID
    );

    // Show more steps if the current step is within visible range
    if (currentIndex < visibleSteps) {
      setVisibleSteps((prevSteps) =>
        Math.min(prevSteps + 1, filteredStatusList.length)
      );
    }
  };

  const handleScroll = (e) => {
    const bottom =
      Math.ceil(e.target.scrollHeight - e.target.scrollTop) <=
      e.target.clientHeight;
    if (bottom && visibleSteps < filteredStatusList.length) {
      setVisibleSteps((prevSteps) =>
        Math.min(prevSteps + 5, filteredStatusList.length)
      );
    }
  };

  const handleReset = () => {
    setActiveStep(null); // Reset the active step
    setCompletedSteps({}); // Clear all completed steps
    setVisibleSteps(5); // Reset visible steps to initial value
  };

  // const [searchUserValue, setSearchUserValue]=useState();
  const [isUserFocused, setIsUserFocused] = useState();
  const [hasUserSelected, setHasUserSelected] = useState(false);
  // const[desginerID,setDesginerID]=useState();

  // Function to fetch users from API
  const getAllUsers = async (pageNum, pageSize, search = "") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        // "https://imlystudios-backend-mqg4.onrender.com/api/users/getAllUsers",
        GETALLUSERS_API,
        {
          params: {
            page: pageNum + 1,
            limit: pageSize,
            SearchText: search,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        users: response.data.users,
        totalCount: response.data.totalItems,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  const handleUserChange = (e) => {
    const value = e.target.value;
    setSearchUserValue(value);

    // Call the API to get users only if the input has more than 0 characters
    if (value.trim().length > 0) {
      getAllUsers(0, 10, value)
        .then((response) => {
          setResults(response.users || []); // Use empty array as fallback
          // If the API returns users, set the designer details based on the first result
          if (response.users && response.users.length > 0) {
            const firstUser = response.users[0]; // Adjust based on your user object
            const designerName = `${firstUser.FirstName} ${firstUser.LastName}`;
            const designerId = firstUser.UserID;

            // Set the designer ID and name
            setDesginerID(designerId);
            setDesignerName(designerName);
          } else {
            // Clear if no users are found
            setDesignerName("");
            setDesginerID("");
          }
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
          setResults([]); // Clear results on error
        });
    } else {
      setResults([]); // Clear results if input is empty
      setDesignerName(""); // Clear designer name if input is empty
      setDesginerID(""); // Clear designer ID if input is empty
    }
  };

  const handleUserSelect = (selectedUser) => {
    // Set the Order Details with the selected user info
    setOrderDetails((prevDetails) => ({
      ...prevDetails,
      DesginerName: `${selectedUser.FirstName} ${selectedUser.LastName}`, // Set Designer Name
      UserID: selectedUser.UserID, // Set UserID
      DesignerID: selectedUser.UserID,
      AssainTo: selectedUser.UserID, // Set AssignTo field with UserID
    }));

    // Set the input field with the selected user's full name
    setSearchUserValue(`${selectedUser.FirstName} ${selectedUser.LastName}`);

    // Set Designer ID and close dropdown
    setDesginerID(selectedUser.UserID); // Correctly set Designer ID on selection
    setIsUserFocused(false); // Close dropdown after selection
  };

  const getAllRoles = async (search = "") => {
    try {
      const response = await axios.get(GETALLROLESS_API, {
        params: {
          SearchText: search,
        },
      });
      return response.data.roles;
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  // Fetch roles on mount or when query changes
  useEffect(() => {
    const fetchRoles = async () => {
      const rolesData = await getAllRoles(query);
      setRoles(rolesData);
      setFilteredRolesList(rolesData);
    };

    fetchRoles();
  }, [query]);

  // Filter roles based on query
  useEffect(() => {
    if (query === "") {
      setFilteredRolesList(roles);
    } else {
      const filtered = roles.filter((role) =>
        role.RoleName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRolesList(filtered);
    }
  }, [roles, query]);

  const handleRoleChanging = (roleID) => {
    setSelectedRole(roleID); // Set the selected RoleID
    // setSelectedRole(statusData.RoleName || "");

    // Update formOrderDetails with UserRoleID for backend submission
    setFormOrderDetails((prevDetails) => ({
      ...prevDetails,
      RoleID: roleID, // Pass UserRoleID to backend
      // RoleName:RoleName,
    }));

    // Validate if a role is selected
    if (!roleID) {
      setErrors((prev) => ({ ...prev, UserRole: "User Role is required." }));
    } else {
      setErrors((prev) => ({ ...prev, UserRole: undefined }));
    }
  };

  const [statusData, setStatusData] = useState(false);

  // Toggle the mode based on certain conditions
  useEffect(() => {
    if (statusData) {
      setStatusData(true);
    }
  }, [statusData]);

  const handleViewDocuments = (event) => {
    event.preventDefault();
    // Logic to handle viewing documents
    if (imagePreviews.length > 0) {
      // Open the first image preview
      window.open(imagePreviews[0], "_blank");
    } else if (pdfPreviews.length > 0) {
      // Open the first PDF preview
      window.open(pdfPreviews[0], "_blank");
    } else if (docPreviews.length > 0) {
      // Open the first document preview (e.g., .doc, .xls, .txt)
      window.open(docPreviews[0].url, "_blank");
    }
  };
  const handleCancelDocuments = () => {
    // Clear both image and PDF previews
    setImagePreviews([]); // Clear image previews
    setPdfPreviews([]);
    setDocPreviews([]);

    // You can also reset the file input if needed
    document.getElementById("UploadFiles").value = "";
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: " 1fr" }, // Ensure proper grid layout
        gap: 2, // Adjust spacing between items
        justifyContent: "center",
        alignItems: "center",
        pt: 2,
      }}
    >
      {isLoading && <LoadingAnimation />}
      <>
        {/* <form onSubmit={saveOrderHistory}> */}
        <form>
          <div className="flex">
            <div className="flex flex-col items-center flex-1 sm:ml-0 lg:ml-5 gap-6">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
                <label className="sm:w-1/4 w-full text-left text-xs font-medium text-gray-700">
                  Order Status:
                </label>

                <Combobox value={selectedStatus} onChange={handleChanging}>
                  <div className="relative w-full sm:w-1/4">
                    <Combobox.Input
                      className={`p-1 w-full border rounded-md ${errors.OrderStatus
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                      onChange={(e) => setQuery(e.target.value)}
                      displayValue={(statusID) => {
                        const selected = filteredStatusList.find(
                          (status) => status.StatusID === statusID
                        );
                        return selected ? selected.OrderStatus : ""; // Ensure selected value is returned
                      }}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </Combobox.Button>

                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
                      {filteredStatusList.length > 0 ? (
                        // Filter the statuses to only show those after the active step
                        filteredStatusList
                          .filter((_, index) =>
                            index === 3
                              ? index >= activeStep
                              : index > activeStep
                          ) // Show statuses after the active one
                          .map((status) => (
                            <Combobox.Option
                              key={status.StatusID}
                              value={status.StatusID}
                              className={({ active }) =>
                                `cursor-pointer select-none relative p-2 ${active
                                  ? "bg-blue-500 text-white"
                                  : "text-gray-900"
                                }`
                              }
                            >
                              {status.OrderStatus}
                            </Combobox.Option>
                          ))
                      ) : (
                        <div className="p-2 text-gray-500">No status found</div>
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>

                {errors.OrderStatus && (
                  <p className="text-red-500 text-sm ml-2">
                    {errors.OrderStatus}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
                <label className="sm:w-1/4 w-full text-left text-xs font-medium text-gray-700">
                  Assigned To
                </label>
                <div className="relative w-full sm:w-1/4">
                  <input
                    type="text"
                    name="AssignedTo"
                    value={searchUserValue}
                    onChange={handleUserChange}
                    onFocus={() => setIsUserFocused(true)}
                    className={`p-1 pr-10 w-full border rounded-md ${errors.AssignedTo ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Search by User Name..."
                  />
                  {errors.AssignedTo && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.AssignedTo}
                    </p>
                  )}

                  {/* Search Icon */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                    <IoIosSearch aria-label="Search Icon" />
                  </div>

                  {/* Dropdown for filtered users */}
                  {isUserFocused &&
                    searchUserValue &&
                    searchUserValue.length >= 1 &&
                    results.length > 0 && (
                      <div
                        className="absolute flex flex-col top-full mt-1 border rounded-lg p-2 w-full bg-white z-10"
                        style={{
                          maxHeight: "200px",
                          overflowY: "auto",
                        }}
                      >
                        <div className="mb-2 text-sm text-gray-600">
                          {results.length} Result{results.length > 1 ? "s" : ""}
                        </div>
                        {results.map((result) => (
                          <div
                            className="relative cursor-pointer p-2 hover:bg-gray-100 group"
                            key={result.CustomerID}
                            onClick={() => handleUserSelect(result)}
                          >
                            <span className="font-medium">
                              {result.FirstName} {result.LastName}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Display No Results Message */}
                  {isUserFocused && searchUserValue && results.length === 0 && (
                    <div className="p-2 overflow-clip text-gray-500">
                      No results found.
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
                <label className="sm:w-1/4 w-full text-left text-xs font-medium text-gray-700">
                  Department:
                </label>
                <Combobox value={selectedRole} onChange={handleRoleChanging}>
                  <div className="relative w-full sm:w-1/4">
                    <Combobox.Input
                      className={`p-1 w-full border rounded-md ${errors.UserRole ? "border-red-500" : "border-gray-300"
                        }`}
                      onChange={(e) => setQuery(e.target.value)}
                      displayValue={(roleID) => {
                        const selected = roles.find(
                          (role) => role.RoleID === roleID
                        );
                        return selected ? selected.RoleName : ""; // Display selected role
                      }}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </Combobox.Button>
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
                      {filteredRolesList.length > 0 ? (
                        filteredRolesList.map((role) => (
                          <Combobox.Option
                            key={role.RoleID}
                            value={role.RoleID}
                            className={({ active }) =>
                              `cursor-pointer select-none relative p-2 ${active
                                ? "bg-blue-500 text-white"
                                : "text-gray-900"
                              }`
                            }
                          >
                            {role.RoleName}
                          </Combobox.Option>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">No roles found</div>
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
              </div>

              <div className=" flex-col hidden sm:flex-row justify-center items-center gap-4 w-full">
                <label className="sm:w-1/4 w-full text-left text-xs font-medium text-gray-700">
                  StartDate
                </label>
                <input
                  type="date"
                  name="StartDate"
                  value={formatDate(formOrderDetails.StartDate)}
                  onChange={handleChange}
                  className={`p-1 w-full sm:w-1/4 border rounded-md ${errors.StartDate ? "border-red-500" : "border-gray-300"
                    }`}
                />
              </div>

              {!editMode && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
                  <label className="sm:w-1/4 w-full text-left text-xs font-medium text-gray-700">
                    Expected Delivery in Days:
                  </label>
                  <input
                    type="number"
                    name="ExpectedDays"
                    value={formOrderDetails.ExpectedDays}
                    onChange={handleExpectedDaysChange}
                    className={`p-1 w-full sm:w-1/4 border rounded-md ${errors.ExpectedDays ? "border-red-500" : "border-gray-300"
                      }`}
                    min="0" // Ensure the user can't select a negative number of days
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
                <label className="sm:w-1/4 w-full text-left text-xs font-medium text-gray-700">
                  Delivery Date:
                </label>
                <input
                  type="date"
                  name="DeliveryDate"
                  value={formatDate(formOrderDetails.DeliveryDate)}
                  onChange={handleDateChanging} // Manually change if needed
                  className={`p-1 w-full sm:w-1/4 border rounded-md ${errors.DeliveryDate ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.DeliveryDate && (
                  <p className="text-red-500 text-sm ml-2">
                    {errors.DeliveryDate}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
                <label className="sm:w-1/4 w-full text-left text-xs font-medium text-gray-700">
                  Upload Document:
                </label>

                {/* Main container for Upload and View/Cancel fields */}
                <div className="flex items-center sm:w-1/4 w-full border rounded-md bg-white p-2 gap-2">
                  {/* Upload Button */}
                  <div className="flex flex-1 items-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="UploadFiles"
                    />
                    <label
                      htmlFor="UploadFiles"
                      className="flex items-center justify-center text-black-500 cursor-pointer bg-gray-200 rounded-md px-3 py-1"
                    >
                      <FaUpload className="mr-2" />
                      <span>Upload</span>
                    </label>
                  </div>

                  {/* View and Cancel Buttons */}
                  <div className="flex flex-1 items-center gap-2">
                    {(imagePreviews.length > 0 || pdfPreviews.length > 0 || docPreviews.length > 0) && (
                      <>
                        {/* View Button */}
                        <button
                          onClick={handleViewDocuments} // This function will handle the view action
                          className="flex items-center justify-center bg-blue-500 text-white rounded-md px-3 py-1"
                        >
                          <FaEye className="mr-2" />
                          View
                        </button>

                        {/* Cancel Button */}
                        <button
                          onClick={handleCancelDocuments} // This function will handle the cancel action (removal of files)
                          className="flex items-center justify-center bg-red-500 text-white rounded-md px-1 py-0.2"
                        >
                          *
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
                <label className="sm:w-1/4 w-full text-left text-xs font-medium text-gray-700">
                  Comments
                </label>
                <textarea
                  name="Comments"
                  value={formOrderDetails.Comments}
                  onChange={(e) =>
                    setFormOrderDetails({
                      ...formOrderDetails,
                      Comments: e.target.value,
                    })
                  }
                  className={`p-2 w-full sm:w-1/4 border rounded-md ${errors.Comments ? "border-red-500" : "border-gray-300"
                    }`}
                  rows={3} // Set the number of visible rows
                />
                {errors.Comments && (
                  <p className="text-red-500 text-sm ml-2">{errors.Comments}</p>
                )}
              </div>
            </div>
            <div onScroll={handleScroll} className="overflow-y-auto pl-4 pr-14">
              <nav aria-label="Progress">
                <ol role="list">
                  {filteredStatusList.map((status, index) => (
                    <li
                      key={status.StatusID}
                      className={`relative pb-5 cursor-pointer ${completedSteps[index] ? "completed" : ""}`}
                    >
                      {/* Step rendering logic with lines */}
                      <div
                        className={`step-indicator flex items-center ${completedSteps[index] ? "text-gray-800" : "text-gray-800"} ${activeStep === index ? "text-orange-500" : ""}`}
                      >
                        {/* Step Circle */}
                        <span
                          className={`mr-2 h-6 w-6 rounded-full flex items-center justify-center ${completedSteps[index] ? "bg-green-400 text-white" : "bg-gray-300"} ${activeStep === index ? "bg-orange-400 text-white" : "bg-gray-300"}`}
                        >
                          {activeStep === index ? (
                            <GrInProgress />
                          ) : completedSteps[index] ? (
                            "✓"
                          ) : (
                            <FaRegUserCircle />
                          )}
                        </span>

                        {/* Status Text */}

                        {/* Conditional rendering based on OrderStatus */}
                        {status.OrderStatus === "Revised Design" &&
                          subStatusId &&
                          subStatusId !== 0 &&
                          subStatusId !== "N/A" ? (
                          <span>
                            {status.OrderStatus} {`R${subStatusId}`}
                          </span>
                        ) : (
                          <span>{status?.OrderStatus}</span>
                        )}

                      </div>

                      {/* Line between steps */}
                      {index < filteredStatusList.length - 1 && (
                        <div
                          className={`absolute top-6 left-3 w-0.5 h-8 bg-gray-300 ${completedSteps[index] ? "bg-green-400" : ""}`}
                        />
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

          </div>
          <div className="relative flex justify-center gap-4">
            <div className=" flex justify-start gap-4">
              <button
                type="button"
                onClick={handleCancel2}
                className="inline-flex justify-center rounded-md border border-transparent text-blue-500 bg-white py-2 px-4 text-sm font-medium  hover:text-black shadow-sm hover:bg-blue-200"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={saveOrderHistory}
                className="button-base save-btn"
              >
                {editMode ? "Update" : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="button-base cancel-btn"
              >
                Cancel
              </button>
            </div>


          </div>
        </form>

        <TableContainer component={Paper} className="mt-4 shadow-md">
          <Table
            aria-label="orders table"
            className="min-w-full border-collapse border border-gray-300"
          >
            <TableHead className="bg-custom-darkblue">
              <TableRow>
                <StyledTableCell
                  align="center"
                  sx={{
                    borderRight: "1px solid #e5e7eb",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Order Status
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    borderRight: "1px solid #e5e7eb",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Delivery Date
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    borderRight: "1px solid #e5e7eb",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Assigned To
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    borderRight: "1px solid #e5e7eb",
                    color: "white",
                    fontWeight: "bold",
                    width: "200px", // Set a fixed width for the comments column
                    overflow: "hidden", // Hide overflow text
                    whiteSpace: "nowrap", // Prevent text from wrapping to the next line
                    textOverflow: "ellipsis", // Show ellipsis (...) for overflowing text
                  }}
                >
                  Comments
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    borderRight: "1px solid #e5e7eb",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Document
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  Actions
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statusDetails.length > 0 ? (
                statusDetails.map((status, index) => (
                  <TableRow key={index} className="hover:bg-gray-100">
                    {/* Order Status */}
                    <StyledTableCell
                      align="center"
                      className="border-r border-gray-300"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {/* Render StatusBadge with a fixed width to maintain alignment */}
                        <div className="flex items-center">
                          <StatusBadge status={status.OrderStatus} />
                        </div>

                        {/* Conditionally render SubStatusId */}
                        {status.OrderStatus === "Revised Design" &&
                          status.SubStatusId !== 0 &&
                          status.SubStatusId !== "N/A" && (
                            <div className="flex items-center justify-center">
                              <div className="w-6 h-6 bg-green-500 text-white flex items-center justify-center rounded-sm">
                                {`R${status.SubStatusId}`}
                              </div>
                            </div>
                          )}
                      </div>
                    </StyledTableCell>

                    <StyledTableCell
                      align="center"
                      className="border-r border-gray-300"
                    >
                      <p className="font-thin">
                        {/* Start Date */}
                        Start Date:{" "}
                        {status.StartDate
                          ? (() => {
                            const date = new Date(status.StartDate);
                            const month = date.toLocaleString("en-US", {
                              month: "short",
                            });
                            const day = String(date.getDate()).padStart(
                              2,
                              "0"
                            ); // Pad day with leading zero if needed
                            const year = date.getFullYear();

                            return `${month} ${day}, ${year}`; // Format: Jan 01, 2024
                          })()
                          : "N/A"}
                        <br />
                        {/* Delivery Date */}
                        End Date:{" "}
                        {status.DeliveryDate
                          ? (() => {
                            const date = new Date(status.DeliveryDate);
                            const month = date.toLocaleString("en-US", {
                              month: "short",
                            });
                            const day = String(date.getDate()).padStart(
                              2,
                              "0"
                            ); // Pad day with leading zero if needed
                            const year = date.getFullYear();

                            return `${month} ${day}, ${year}`; // Format: Jan 01, 2024
                          })()
                          : "N/A"}
                      </p>
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      className="border-r border-gray-300"
                    >
                      <p className="font-thin">
                        {/* Log the status object */}
                        {/* Display the FirstName */}
                        Assigned To: {status?.AssignTo || "N/A"}
                        <br />
                        Department: {status?.RoleName || "N/A"}
                      </p>
                    </StyledTableCell>

                    <StyledTableCell
                      align="center"
                      className="border-r border-gray-300"
                      sx={{
                        width: "100px", // Set a fixed width for the column if needed
                        wordBreak: "break-word", // Ensures long words break and wrap correctly
                        whiteSpace: "normal", // Allow text to wrap to the next line
                        overflow: "hidden", // Prevent overflow from growing the cell size
                      }}
                    >
                      {status.Comments || "N/A"}
                    </StyledTableCell>

                    {/* Document Links */}
                    <StyledTableCell
                      align="center"
                      className="border-r border-gray-300"
                    >
                      {Array.isArray(status.viewdocuments) &&
                        status.viewdocuments.length > 0 ? (
                        status.viewdocuments.map((url, docIndex) => (
                          <div
                            key={docIndex}
                            className="flex items-center mb-0"
                          >
                            <IconButton
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              color="primary"
                            >
                              <AiOutlineEye size={20} />
                              <span className="ml-2 font-bold text-sm">
                                View
                              </span>
                            </IconButton>
                          </div>
                        ))
                      ) : (
                        <span>No Documents to View</span>
                      )}

                      {Array.isArray(status.DownloadDocuments) &&
                        status.DownloadDocuments.length > 0 ? (
                        status.DownloadDocuments.map((url, docIndex) => (
                          <div
                            key={docIndex}
                            className="flex items-center mb-0"
                          >
                            <IconButton href={url} download color="success">
                              <FiDownload size={20} />
                              <span className="ml-2 font-bold text-sm">
                                Download
                              </span>
                            </IconButton>
                          </div>
                        ))
                      ) : (
                        <span></span>
                      )}
                    </StyledTableCell>

                    {/* Actions - Edit and Delete */}
                    <StyledTableCell
                      align="center"
                      className="border-r border-gray-300"
                    >
                      <div className="flex justify-center gap-2">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() =>
                            handleEditstatus(
                              status.OrderHistoryID,
                              status.StatusID
                            )
                          }
                          className="button edit-button"
                        >
                          <AiOutlineEdit
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                          Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          // onClick={() => handleDelete(generatedId)}
                          className="button delete-button"
                        >
                          <MdOutlineCancel
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                          Delete
                        </button>
                      </div>
                    </StyledTableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <StyledTableCell align="center" colSpan={7}>
                    {isLoading
                      ? "Loading..."
                      : error
                        ? error
                        : "No Order Found"}
                  </StyledTableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalRecords}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </>
    </Box>
  );
};

export default YourComponent;
