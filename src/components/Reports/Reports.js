import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaUndo,
  FaComments,
  FaFileAlt,
  FaClipboardList,
} from "react-icons/fa";
import { Combobox } from "@headlessui/react"; // Import Combobox from Headless UI
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/outline"; // Adjust the path b
import axios from "axios";
import { FaCalendarAlt } from "react-icons/fa";
import {
  GETALLSTORES_API,
  CUSTOMER_REPORT_API,
  ORDER_STATUS_API,
  PAYMENT_REPORT_API,
  GET_INVENTORY_FILE_API,
  GET_INVENTORY_FILE_UPL_API,
  GET_ALL_ORDERS,
  GET_ORDER_REPORT,
} from "../../Constants/apiRoutes";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Datepicker from "react-tailwindcss-datepicker";
import LoadingAnimation from "../../components/Loading/LoadingAnimation";
import { DataContext } from "../../Context/DataContext";
import { OrderContext } from "../../Context/orderContext";

function ReportGenerator() {
  const [activeTab, setActiveTab] = useState("salesReport");

  const [loading, setLoading] = useState(true);
  const [orderIds, setOrderIds] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null); // Initially null
  const [selectedOrder, setSelectedOrder] = useState(""); // For storing the selected order number
  // 1. Define the state for storing order status list and selected status
  const [orderStatusList, setOrderStatusList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // 2. Define the state for handling input query and filtered status list
  const [query, setQuery] = useState("");
  const [filteredStatusList, setFilteredStatusList] = useState([]);

  // 3. Define errors state for validation
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [salesReport, setSalesReport] = useState({
    dateRange: { startDate: "", endDate: "" },
    productCategory: "",
    store: "", // Added store field
  });

  const [paymentReport, setPaymentReport] = useState({
    dateRange: { startDate: "", endDate: "" },
    productCategory: "",
    store: "",
  });

  const [returnReport, setReturnReport] = useState({
    dateRange: { startDate: "", endDate: "" },
    productCategory: "",
    store: "",
  });

  const { setOrderIdDetails } = useContext(OrderContext);

  const { storesData } = useContext(DataContext);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  useEffect(() => {
    if (storesData) {
      setStores(storesData || []);
    }
  }, [storesData]);

  const [customerFeedback, setCustomerFeedback] = useState({
    dateRange: { startDate: "", endDate: "" },
    productCategory: "",
    store: "",
  });

  const [generatedReport, setGeneratedReport] = useState(null);
  const [selectedStore2, setSelectedStore2] = useState(null);
  const [selectedStore3, setSelectedStore3] = useState(null);

  const handleInputChange = (reportType, field, value) => {
    if (reportType === "salesReport") {
      setSalesReport({ ...salesReport, [field]: value });
    } else if (reportType === "paymentReport") {
      setPaymentReport({ ...paymentReport, [field]: value });
    } else if (reportType === "returnReport") {
      setReturnReport({ ...returnReport, [field]: value });
    } else if (reportType === "customerFeedback") {
      setCustomerFeedback({ ...customerFeedback, [field]: value });
    }
  };

  const handleSubmit = (reportType) => {
    if (reportType === "salesReport") {
      setGeneratedReport({ reportType: "salesReport", data: salesReport });
    } else if (reportType === "paymentReport") {
      setGeneratedReport({ reportType: "paymentReport", data: paymentReport });
    } else if (reportType === "returnReport") {
      setGeneratedReport({ reportType: "returnReport", data: returnReport });
    } else if (reportType === "customerFeedback") {
      setGeneratedReport({
        reportType: "customerFeedback",
        data: customerFeedback,
      });
    }
  };

  const exportToExcel = (reportType, data) => {
    const dataArray = Array.isArray(data) ? data : [data];
    const ws = XLSX.utils.json_to_sheet(dataArray);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${reportType} Report`);
    XLSX.writeFile(wb, `${reportType}_report.xlsx`);
  };

  const exportToPDF = (reportType, data) => {
    const dataArray = Array.isArray(data) ? data : [data];
    const doc = new jsPDF();
    doc.setFontSize(12);

    doc.text(
      `${reportType
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())} Report`,
      10,
      10
    );

    let yOffset = 20;
    dataArray.forEach((report, index) => {
      if (yOffset > 270) {
        // Check if page is full
        doc.addPage();
        yOffset = 10;
      }
      doc.text(`${index + 1}. ${JSON.stringify(report)}`, 10, yOffset);
      yOffset += 10;
    });

    doc.save(`${reportType}_report.pdf`);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]); // State for the search term
  const [filteredOrders, setFilteredOrders] = useState(orders); // State for filtered orders

  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [dateRange1, setDateRange1] = useState({
    startDate: null,
    endDate: null,
  });
  const [dateRange2, setDateRange2] = useState({
    startDate: null,
    endDate: null,
  });

  // Handler for date selection
  const handleDateChange = (newValue) => {
    setDateRange(newValue); // Set the selected date range
  };
  const handleDateChange1 = (newValue) => {
    setDateRange1(newValue); // Set the selected date range
  };
  const handleDateChange2 = (newValue) => {
    setDateRange2(newValue); // Set the selected date range
  };

  // Format date for input fields
  const formatDate = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };
  const [selectedReferralType, setSelectedReferralType] = useState("");
  const [selectedReferenceSubOption, setSelectedReferenceSubOption] =
    useState("");
  const [selectedSocialMediaPlatform, setSelectedSocialMediaPlatform] =
    useState("");
  const [orderDetails, setOrderDetails] = useState({
    ReferedBy: "",
    refereeName: "",
  });
  const [error, setError] = useState("");

  // Handle referral type selection
  const handleReferralTypeChange = (value) => {
    setSelectedReferralType(value);
    setOrderDetails({ ...orderDetails, ReferedBy: value });
    // Reset sub-options if switching referral types
    setSelectedReferenceSubOption("");
    setSelectedSocialMediaPlatform("");
  };

  // Handle sub-option changes for Reference
  const handleReferenceSubOptionChange = (value) => {
    setSelectedReferenceSubOption(value);
  };

  // Handle sub-option changes for Social Media Platform
  const handleSocialMediaPlatformChange = (value) => {
    setSelectedSocialMediaPlatform(value);
  };

  // Handle referee name input change
  const handleRefereeNameChange = (e) => {
    setOrderDetails({ ...orderDetails, refereeName: e.target.value });
  };
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileData, setFileData] = useState(null); // Store uploaded file data
  const [manualFileID, setManualFileID] = useState("");
  const [fileID, setFileID] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage(""); // Reset message on file selection
    }
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const uploadUrl = GET_INVENTORY_FILE_UPL_API;

    const formData = new FormData();
    formData.append("UploadDocument", selectedFile); // Ensure this is the correct field name

    setUploading(true);
    setIsLoading(true); // Set uploading state to true

    fetch(uploadUrl, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Upload failed");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        setFileData(data);
        setMessage("File uploaded successfully!");

        // Assuming the response contains a FileID field
        if (data && data.FileID) {
          setFileID(data.FileID); // Store the File ID for later use
        }

        // Show success toast
        toast.success("File uploaded successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        setMessage("File upload failed.");

        // Show error toast
        toast.error("File upload failed.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      })
      .finally(() => {
        setUploading(false); // Reset uploading state
        setSelectedFile(null);
        setIsLoading(false); // Reset selected file after upload
      });
  };
  const handleFileDownload = () => {
    const fileToDownload = fileID || 1;
    if (fileToDownload) {
      setIsLoading(true);
      const downloadUrl = GET_INVENTORY_FILE_API(fileToDownload);
      fetch(downloadUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch file data");
          }
          return response.json();
        })
        .then((data) => {
          const { downloadUrl } = data; // Get download URL from the response
          if (downloadUrl) {
            // Create a temporary link element
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.setAttribute("download", "file"); // Set the download attribute with a default filename
            document.body.appendChild(link);
            link.click(); // Trigger the download
            document.body.removeChild(link);

            // Show success toast message
            toast.success("File downloaded successfully!", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          } else {
            toast.error(
              "Download URL is not available for the uploaded file.",
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
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          toast.error(
            "Failed to download the file using the uploaded file ID.",
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
        });
    } else {
      toast.warn("No file uploaded. Please upload a file first.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setIsLoading(false);
  };

  // useEffect(() => {
  //   const fetchStores = async () => {
  //     try {
  //       const response = await axios.get(GETALLSTORES_API);
  //       console.log("API Response:", response.data);

  //       // Extract the Stores array from the API response
  //       const storesData = response.data.Stores || [];

  //       // Check if it's an array and set store names
  //       setStoreNames(Array.isArray(storesData) ? storesData : []);
  //     } catch (error) {
  //       console.error("Error fetching stores:", error);
  //     }
  //   };
  //   setIsLoading(false);
  //   fetchStores();
  // }, []);
  //fe
  useEffect(() => {
    const fetchOrderStatuses = async () => {
      try {
        const response = await axios.get(ORDER_STATUS_API);

        // Log the data to see its structure
        console.log("Fetched Order Statuses:", response.data);

        // Check if data is in the expected format
        if (Array.isArray(response.data.data)) {
          setOrderStatusList(response.data.data);
        } else {
          console.error("Data is not in the expected format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching order statuses:", error);
      }
    };

    fetchOrderStatuses();
  }, []);

  useEffect(() => {
    const filtered = orderStatusList.filter((status) =>
      status.OrderStatus.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStatusList(filtered);
  }, [query, orderStatusList]);

  const handleSelect = (statusID) => {
    setSelectedStatus(statusID);
  };

  useEffect(() => {
    const fetchOrderNumbers = async () => {
      try {
        const response = await fetch(GET_ALL_ORDERS); // Use the constant here
        const data = await response.json();

        if (data.StatusCode === "SUCCESS" && Array.isArray(data.data)) {
          setOrders(data.data); // Store the full order objects
        } else {
          console.error("Unexpected data format:", data);
        }
      } catch (error) {
        console.error("Error fetching order numbers:", error);
      }
    };

    fetchOrderNumbers();
  }, []);

  useEffect(() => {
    if (typeof searchTerm === "string" && searchTerm.trim() !== "") {
      const filtered = orders.filter((order) =>
        order.OrderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );

      console.log("Filtered Orders:", filtered); // Log filtered orders
      setFilteredOrders(filtered);

      // Automatically select the order if there is only one match
      if (filtered.length === 1) {
        console.log("Single Match:", filtered[0]); // Log the single match
        setSearchTerm(filtered[0].OrderNumber);
        setSelectedOrderId(filtered[0].OrderID); // Set OrderID here
        console.log("Selected OrderID:", filtered[0].OrderID); // Log selected OrderID
        setFilteredOrders([]); // Clear dropdown once a match is found
      }
    } else {
      setFilteredOrders(orders); // Show all orders when search term is empty
    }
  }, [searchTerm, orders]);

  const handleInputChange1 = (e) => {
    setSearchTerm(e.target.value); // Update search term
  };
  const handleInputChange2 = (selectedOrder) => {
    console.log("Selected Order:", selectedOrder); // Log selected order object
    setSearchTerm(selectedOrder.OrderNumber); // Update the input field with the OrderNumber
    setSelectedOrderId(selectedOrder.OrderID); // Set the OrderID
    console.log("Selected OrderID:", selectedOrder.OrderID); // Log OrderID after selection
    setFilteredOrders([]); // Clear dropdown after selection
  };

  useEffect(() => {
    console.log("Selected OrderId:", selectedOrderId); // This should log the correct OrderId
  }, [selectedOrderId]);


  // Define handleInputChange2 function
  const postData = async () => {
    setIsLoading(true);
    const url = PAYMENT_REPORT_API; // API endpoint

    // Define the request body (JSON format)
    const data = {
      StartDate: dateRange1.startDate
        ? formatDate(new Date(dateRange1.startDate))
        : null,
      EndDate: dateRange1.endDate
        ? formatDate(new Date(dateRange1.endDate))
        : null,
      StoreID: selectedStore2 ? selectedStore2.StoreID : null,
      OrderID: selectedOrderId || null,
    };

    try {
      // Make the POST request
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Check if the response is okay
      if (response.ok) {
        // Process response as a blob for the Excel file
        const blob = await response.blob();

        // Create a link element
        const link = document.createElement("a");
        // Set the blob URL as the href
        link.href = window.URL.createObjectURL(blob);
        // Set the download attribute with a filename (e.g., "payment_report.xlsx")
        link.download = "payment_report.xlsx"; // Adjust the filename as needed
        // Append the link to the body
        document.body.appendChild(link);
        // Programmatically click the link to trigger the download
        link.click();
        // Remove the link from the document
        link.remove();

        // Show success toast
        toast.success("Excel file downloaded successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        const errorText = await response.text(); // Get the error message from the response
        console.error(
          "Failed to download the file:",
          response.status,
          response.statusText,
          errorText
        );

        // Parse the error text as JSON and extract the error message
        let errorMessage = "";
        try {
          const parsedError = JSON.parse(errorText);
          errorMessage = parsedError.error; // Access the error message
        } catch (e) {
          errorMessage = "An unexpected error occurred"; // Fallback error message
        }

        // Show error toast with backend message
        toast.error(`Failed to download the file: ${errorMessage}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Error while fetching the report:", error);
      // Show error toast with error message
      toast.error(`Error while fetching the report: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setIsLoading(false);
  };

  const postData0 = async () => {
    setIsLoading(true);
    const url = GET_ORDER_REPORT; // New API endpoint

    // Define the request body (JSON format)
    const data = {
      StartDate: dateRange.startDate
        ? formatDate(new Date(dateRange.startDate))
        : null,
      EndDate: dateRange.endDate
        ? formatDate(new Date(dateRange.endDate))
        : null,
      StoreID: selectedStore ? selectedStore.StoreID : null, // Use selected store for ID
      StatusID: selectedStatus || null, // Ensure status is not undefined
    };

    try {
      // Make the POST request
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Log the content type
      const contentType = response.headers.get("Content-Type");
      console.log("Content-Type:", contentType);

      // Check if the response is okay
      if (
        response.ok &&
        contentType ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        // Process response as a blob for the Excel file
        const blob = await response.blob();
        console.log(blob); // Log the blob to check its content

        // Create a link element
        const link = document.createElement("a");
        // Set the blob URL as the href
        link.href = window.URL.createObjectURL(blob);
        // Set the download attribute with a filename
        link.download = "order_report.xlsx";
        // Append the link to the body
        document.body.appendChild(link);
        // Programmatically click the link to trigger the download
        link.click();
        // Remove the link from the document
        link.remove();

        // Show success toast
        toast.success("Excel file downloaded successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        const errorText = await response.text(); // Get the error message from the response
        console.error(
          "Failed to download the file:",
          response.status,
          response.statusText,
          errorText
        );

        // Parse the error text as JSON and extract the error message
        let errorMessage = "";
        try {
          const parsedError = JSON.parse(errorText);
          errorMessage = parsedError.error; // Access the error message
        } catch (e) {
          errorMessage = "An unexpected error occurred"; // Fallback error message
        }

        // Show error toast with backend message
        toast.error(`Failed to download the file: ${errorMessage}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Error while fetching the report:", error);
      // Show error toast with error message
      toast.error(`Error while fetching the report: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setIsLoading(false);
  };
  
  const postData1 = async () => {
    setIsLoading(true);
    const url = CUSTOMER_REPORT_API; // New API endpoint

    // Define the request body (JSON format)
    const data = {
      StartDate: dateRange2.startDate
        ? formatDate(new Date(dateRange2.startDate))
        : null,
      EndDate: dateRange2.endDate
        ? formatDate(new Date(dateRange2.endDate))
        : null,
      StoreID: selectedStore3 ? selectedStore3.StoreID : null, // Use selected store for ID
      ReferredBy: paymentReport.productCategory || null,
    };

    try {
      // Make the POST request
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Check if the response is okay
      if (response.ok) {
        // Process response as a blob for the Excel file
        const blob = await response.blob();

        // Create a link element
        const link = document.createElement("a");
        // Set the blob URL as the href
        link.href = window.URL.createObjectURL(blob);
        // Set the download attribute with a filename
        link.download = "customer_report.xlsx"; // Adjust the filename as needed
        // Append the link to the body
        document.body.appendChild(link);
        // Programmatically click the link to trigger the download
        link.click();
        // Remove the link from the document
        link.remove();

        // Show success toast
        toast.success("Excel file downloaded successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        const errorText = await response.text(); // Get the error message from the response
        console.error(
          "Failed to download the file:",
          response.status,
          response.statusText,
          errorText
        );

        // Parse the error text as JSON and extract the error message
        let errorMessage = "";
        try {
          const parsedError = JSON.parse(errorText);
          errorMessage = parsedError.error; // Access the error message
        } catch (e) {
          errorMessage = "An unexpected error occurred"; // Fallback error message
        }

        // Show error toast with backend message
        toast.error(`Failed to download the file: ${errorMessage}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Error while fetching the report:", error);
      // Show error toast with error message
      toast.error(`Error while fetching the report: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setIsLoading(false);
  };
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 ml-10 lg:ml-80 w-auto p-6 mt-10 mx-10 mb-10">
      <ToastContainer />
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
          <LoadingAnimation />
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Report Generator</h2>
      <div class="text-sm font-medium text-center ml-20 text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul class="flex flex-wrap -mb-px">
          <li className="me-2">
            <button
              onClick={() => setActiveTab("salesReport")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "salesReport"
                  ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500" // Active styles
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" // Inactive styles
              }`}
            >
              <FaChartLine
                className="inline-block mr-2"
                color={activeTab === "salesReport" ? "#2563EB" : "#6B7280"} // Active: Blue, Inactive: Gray
              />
              Sales Report
            </button>
          </li>
          <li class="me-2">
            <button
              onClick={() => setActiveTab("paymentReport")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "paymentReport"
                  ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500" // Active styles
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" // Inactive styles
              }`}
            >
              <FaMoneyBillWave
                className="inline-block mr-2"
                color={activeTab === "paymentReport" ? "#2563B5" : "#FFC107"} // Active: Blue, Inactive: Gray
              />
              Payment Report
            </button>
          </li>
          <li class="me-2">
            <button
              onClick={() => setActiveTab("returnReport")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "returnReport"
                  ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500" // Active styles
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" // Inactive styles
              }`}
            >
              <FaFileAlt
                className="inline-block mr-2"
                color={activeTab === "returnReport" ? "#2563EB" : "#28A745"} // Active: Blue, Inactive: Gray
              />
              Customer Report
            </button>
          </li>
          <li class="me-2">
            <button
              onClick={() => setActiveTab("customerFeedback")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "customerFeedback"
                  ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500" // Active styles
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" // Inactive styles
              }`}
            >
              {" "}
              <FaClipboardList
                className="inline-block mr-2"
                color={activeTab === "customerFeedback" ? "#2563EB" : "#DC3545"} // Active: Blue, Inactive: Gray
              />
              Inventory Report
            </button>
          </li>
        </ul>
      </div>
      {activeTab === "salesReport" && (
        <>
          <div className="mb-8 ml-10 mt-10 md:ml-40 lg:ml-60">
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    Date Range
                  </label>
                  <div className="w-full md:w-64">
                    {" "}
                    {/* Set the same width for Datepicker */}
                    <Datepicker
                      popoverDirection="down"
                      showShortcuts={true}
                      showFooter={true}
                      placeholder="Start Date and End Date"
                      primaryColor={"purple"}
                      value={dateRange} // Pass the selected dates as an object
                      onChange={handleDateChange}
                      popoverClassName="custom-popover"
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={
                      dateRange.startDate ? formatDate(dateRange.startDate) : ""
                    }
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        startDate: new Date(e.target.value),
                      })
                    }
                    className="p-2 w-full md:w-64 border rounded-md" // Set consistent width
                  />
                </div>

                {/* End Date */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formatDate(dateRange.endDate)}
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        endDate: new Date(e.target.value),
                      })
                    }
                    className="p-2 w-full md:w-64 border rounded-md" // Set consistent width
                  />
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    Store
                  </label>
                  <Combobox value={selectedStore} onChange={setSelectedStore}>
                    <div className="relative w-full md:w-64">
                      <Combobox.Input
                        className="p-2 w-full border rounded-md border-gray-300"
                        displayValue={(store) =>
                          store?.StoreName || "Select Store Name"
                        }
                        placeholder="Select Store Name"
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
                        {/* Add "Select Store ID" option */}
                        <Combobox.Option
                          key="select-store-id"
                          className={({ active }) =>
                            `cursor-pointer select-none relative p-2 ${
                              active
                                ? "bg-blue-500 text-white"
                                : "text-gray-900"
                            }`
                          }
                          value={{
                            StoreID: null,
                            StoreName: "Select Store ID",
                          }}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={
                                  selected ? "font-semibold" : "font-normal"
                                }
                              >
                                Select Store ID
                              </span>
                              {selected && (
                                <CheckIcon
                                  className="h-5 w-5 text-white absolute right-2"
                                  aria-hidden="true"
                                />
                              )}
                            </>
                          )}
                        </Combobox.Option>

                        {/* Render all store options */}
                        {stores.map((store) => (
                          <Combobox.Option
                            key={store.StoreID}
                            className={({ active }) =>
                              `cursor-pointer select-none relative p-2 ${
                                active
                                  ? "bg-blue-500 text-white"
                                  : "text-gray-900"
                              }`
                            }
                            value={store}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={
                                    selected ? "font-semibold" : "font-normal"
                                  }
                                >
                                  {store.StoreName}
                                </span>
                                {selected && (
                                  <CheckIcon
                                    className="h-5 w-5 text-white absolute right-2"
                                    aria-hidden="true"
                                  />
                                )}
                              </>
                            )}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    Status
                  </label>
                  <Combobox value={selectedStatus} onChange={handleSelect}>
                    <div className="relative w-full md:w-64">
                      {" "}
                      {/* Consistent width */}
                      <Combobox.Input
                        className={`p-2 w-full border rounded-md ${
                          errors.OrderStatus
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) => setQuery(e.target.value)}
                        displayValue={(statusID) =>
                          orderStatusList.find(
                            (status) => status.StatusID === statusID
                          )?.OrderStatus || ""
                        }
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
                        {filteredStatusList.length > 0 ? (
                          filteredStatusList.map((status) => (
                            <Combobox.Option
                              key={status.StatusID}
                              value={status.StatusID}
                              className={({ active }) =>
                                `cursor-pointer select-none relative p-2 ${
                                  active
                                    ? "bg-blue-500 text-white"
                                    : "text-gray-900"
                                }`
                              }
                            >
                              {status.OrderStatus}
                            </Combobox.Option>
                          ))
                        ) : (
                          <div className="p-2 text-gray-500">
                            No status found
                          </div>
                        )}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={postData0}
              className="bg-custom-blue mt-5 ml-40 mr-4 text-white px-4 py-2 rounded-md"
            >
              Download Report
            </button>
          </div>
        </>
      )}

      {activeTab === "paymentReport" && (
        <>
          <div className="mb-8 ml-10 mt-10 md:ml-40 lg:ml-60">
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    Date Range
                  </label>
                  <div className="w-full md:w-64">
                    {" "}
                    {/* Set the same width for Datepicker */}
                    <Datepicker
                      popoverDirection="down"
                      showShortcuts={true}
                      showFooter={true}
                      placeholder="Start Date and End Date"
                      primaryColor={"purple"}
                      value={dateRange1} // Pass the selected dates as an object
                      onChange={handleDateChange1}
                      popoverClassName="custom-popover"
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={
                      dateRange1.startDate
                        ? formatDate(dateRange1.startDate)
                        : ""
                    }
                    onChange={(e) =>
                      setDateRange1({
                        ...dateRange1,
                        startDate: new Date(e.target.value),
                      })
                    }
                    className="p-2 w-full md:w-64 border rounded-md" // Set consistent width
                  />
                </div>

                {/* End Date */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={
                      dateRange1.endDate ? formatDate(dateRange1.endDate) : ""
                    }
                    onChange={(e) =>
                      setDateRange1({
                        ...dateRange1,
                        endDate: new Date(e.target.value),
                      })
                    }
                    className="p-2 w-full md:w-64 border rounded-md" // Set consistent width
                  />
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    Store
                  </label>
                  <Combobox value={selectedStore2} onChange={setSelectedStore2}>
                    <div className="relative w-full md:w-64">
                      <Combobox.Input
                        className="p-2 w-full border rounded-md border-gray-300"
                        displayValue={(store) =>
                          store?.StoreName || "Select Store Name"
                        }
                        placeholder="Select Store Name"
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
                        {/* Add "Select Store ID" option */}
                        <Combobox.Option
                          key="select-store-id"
                          className={({ active }) =>
                            `cursor-pointer select-none relative p-2 ${
                              active
                                ? "bg-blue-500 text-white"
                                : "text-gray-900"
                            }`
                          }
                          value={{
                            StoreID: null,
                            StoreName: "Select Store ID",
                          }}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={
                                  selected ? "font-semibold" : "font-normal"
                                }
                              >
                                Select Store ID
                              </span>
                              {selected && (
                                <CheckIcon
                                  className="h-5 w-5 text-white absolute right-2"
                                  aria-hidden="true"
                                />
                              )}
                            </>
                          )}
                        </Combobox.Option>

                        {/* Render all store options */}
                        {stores.map((store) => (
                          <Combobox.Option
                            key={store.StoreID}
                            className={({ active }) =>
                              `cursor-pointer select-none relative p-2 ${
                                active
                                  ? "bg-blue-500 text-white"
                                  : "text-gray-900"
                              }`
                            }
                            value={store}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={
                                    selected ? "font-semibold" : "font-normal"
                                  }
                                >
                                  {store.StoreName}
                                </span>
                                {selected && (
                                  <CheckIcon
                                    className="h-5 w-5 text-white absolute right-2"
                                    aria-hidden="true"
                                  />
                                )}
                              </>
                            )}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    Order Number
                  </label>
                  <div className="relative w-full md:w-64">
                    {/* Search input */}
                    <input
                      type="text"
                      placeholder="Search Order Number"
                      className="p-2 w-full border rounded-md border-gray-300"
                      value={searchTerm}
                      onChange={handleInputChange1}
                    />

                    {/* Display filtered order numbers only if there are multiple matches */}
                    {searchTerm && filteredOrders.length > 0 && (
                      <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
                        {filteredOrders.map((order) => (
                          <li
                            key={order.OrderId} // Make sure OrderId exists here
                            onClick={() => handleInputChange2(order)} // Pass the full order object
                            className="cursor-pointer select-none relative p-2 hover:bg-blue-500 hover:text-white"
                          >
                            {order.OrderNumber} {/* Display only OrderNumber */}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={postData}
              className="bg-custom-blue mt-5 ml-40 mr-4 text-white px-4 py-2 rounded-md"
            >
              Download Report
            </button>
          </div>
        </>
      )}

      {activeTab === "returnReport" && (
        <>
          <div className="mb-8 ml-10 mt-10 md:ml-40 lg:ml-60">
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    Date Range
                  </label>
                  <div className="w-full md:w-64">
                    {" "}
                    {/* Set the same width for Datepicker */}
                    <Datepicker
                      popoverDirection="down"
                      showShortcuts={true}
                      showFooter={true}
                      placeholder="Start Date and End Date"
                      primaryColor={"purple"}
                      value={dateRange2} // Pass the selected dates as an object
                      onChange={handleDateChange2}
                      popoverClassName="custom-popover"
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={
                      dateRange2.startDate
                        ? formatDate(dateRange2.startDate)
                        : ""
                    }
                    onChange={(e) =>
                      setDateRange2({
                        ...dateRange,
                        startDate: new Date(e.target.value),
                      })
                    }
                    className="p-2 w-full md:w-64 border rounded-md" // Set consistent width
                  />
                </div>

                {/* End Date */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={
                      dateRange2.endDate ? formatDate(dateRange2.endDate) : ""
                    }
                    onChange={(e) =>
                      setDateRange2({
                        ...dateRange2,
                        endDate: new Date(e.target.value),
                      })
                    }
                    className="p-2 w-full md:w-64 border rounded-md" // Set consistent width
                  />
                </div>
                {/* Store */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    Store
                  </label>
                  <Combobox value={selectedStore3} onChange={setSelectedStore3}>
                    <div className="relative w-full md:w-64">
                      <Combobox.Input
                        className="p-2 w-full border rounded-md border-gray-300"
                        displayValue={(store) =>
                          store?.StoreName || "Select Store Name"
                        }
                        placeholder="Select Store Name"
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
                        {/* Add "Select Store ID" option */}
                        <Combobox.Option
                          key="select-store-id"
                          className={({ active }) =>
                            `cursor-pointer select-none relative p-2 ${
                              active
                                ? "bg-blue-500 text-white"
                                : "text-gray-900"
                            }`
                          }
                          value={{
                            StoreID: null,
                            StoreName: "Select Store ID",
                          }}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={
                                  selected ? "font-semibold" : "font-normal"
                                }
                              >
                                Select Store ID
                              </span>
                              {selected && (
                                <CheckIcon
                                  className="h-5 w-5 text-white absolute right-2"
                                  aria-hidden="true"
                                />
                              )}
                            </>
                          )}
                        </Combobox.Option>

                        {/* Render all store options */}
                        {stores.map((store) => (
                          <Combobox.Option
                            key={store.StoreID}
                            className={({ active }) =>
                              `cursor-pointer select-none relative p-2 ${
                                active
                                  ? "bg-blue-500 text-white"
                                  : "text-gray-900"
                              }`
                            }
                            value={store}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={
                                    selected ? "font-semibold" : "font-normal"
                                  }
                                >
                                  {store.StoreName}
                                </span>
                                {selected && (
                                  <CheckIcon
                                    className="h-5 w-5 text-white absolute right-2"
                                    aria-hidden="true"
                                  />
                                )}
                              </>
                            )}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                </div>
                {/* Product Category */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  <label className="text-xs font-medium text-gray-700 w-full md:w-40">
                    Referred By
                  </label>
                  <Combobox
                    value={paymentReport.productCategory}
                    onChange={(value) =>
                      handleInputChange(
                        "paymentReport",
                        "productCategory",
                        value
                      )
                    }
                  >
                    <div className="relative w-full md:w-64">
                      {" "}
                      {/* Set consistent width */}
                      <Combobox.Input
                        className="p-2 w-full border rounded-md border-gray-300"
                        displayValue={(category) => category || ""}
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
                        {["Social Media", "Walk-In", "Reference"].map(
                          (option, index) => (
                            <Combobox.Option
                              key={index}
                              value={option}
                              className={({ active }) =>
                                `cursor-pointer select-none relative p-2 ${
                                  active
                                    ? "bg-blue-500 text-white"
                                    : "text-gray-900"
                                }`
                              }
                            >
                              {option}
                            </Combobox.Option>
                          )
                        )}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                </div>

                {selectedReferralType === "Reference" && (
                  <div className="mt-4">
                    <label className="text-xs font-medium text-gray-700">
                      Reference Sub-option
                    </label>
                    <Combobox
                      value={selectedReferenceSubOption}
                      onChange={handleReferenceSubOptionChange}
                    >
                      <div className="relative w-full md:w-64">
                        {" "}
                        {/* Set consistent width */}
                        <Combobox.Input
                          className="p-1 w-full border rounded-md border-gray-300"
                          displayValue={(option) => option || ""}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </Combobox.Button>
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
                          {["Director", "Employee", "Existing"].map(
                            (option, index) => (
                              <Combobox.Option
                                key={index}
                                value={option}
                                className={({ active }) =>
                                  `cursor-pointer select-none relative p-2 ${
                                    active
                                      ? "bg-blue-500 text-white"
                                      : "text-gray-900"
                                  }`
                                }
                              >
                                {option}
                              </Combobox.Option>
                            )
                          )}
                        </Combobox.Options>
                      </div>
                    </Combobox>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={postData1}
              className="bg-custom-blue mt-5 ml-40 mr-4 text-white px-4 py-2 rounded-md"
            >
              Download Report
            </button>
          </div>
        </>
      )}

      {activeTab === "customerFeedback" && (
        <>
          <div className="mb-8 ml-10 mt-10 md:ml-20 lg:ml-40">
            <div className="grid grid-cols-1 gap-6">
              {/* Upload and Download Section */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <label className="text-sm font-semibold text-gray-800 w-full md:w-40">
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="p-2 w-full md:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className={`p-2 w-full md:w-40 rounded-lg text-white transition-colors duration-300 ${
                    uploading
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>

                <button
                  onClick={handleFileDownload}
                  className="p-2 w-full md:w-40 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-300"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ReportGenerator;
