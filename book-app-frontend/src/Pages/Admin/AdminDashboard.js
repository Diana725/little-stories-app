import React from "react";
import BookUploadForm from "./BookUploadForm";
import PageUploadForm from "./PageUploadForm";

const AdminDashboard = () => {
  return (
    <div className="container mt-5">
      <h1>Admin Dashboard</h1>
      <BookUploadForm />
      <hr />
      <PageUploadForm />
    </div>
  );
};

export default AdminDashboard;
