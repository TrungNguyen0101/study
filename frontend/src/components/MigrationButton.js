import React, { useState } from "react";
import vocabularyAPI from "../services/api";

const MigrationButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(true);

  const handleMigration = async () => {
    if (
      !window.confirm(
        "Bạn có chắc muốn migration tất cả vocabulary cũ cho tài khoản hiện tại?"
      )
    ) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await vocabularyAPI.migrateVocabulariesToUser();

      if (response.data.success) {
        setMessage(`✅ ${response.data.message}`);

        // Ẩn nút sau khi migration thành công và có dữ liệu
        if (response.data.migrated > 0) {
          setTimeout(() => {
            setShow(false);
          }, 3000);
        }
      } else {
        setMessage(`❌ ${response.data.error}`);
      }
    } catch (error) {
      console.error("Migration error:", error);
      setMessage(`❌ Lỗi: ${error.response?.data?.error || error.message}`);
    }

    setLoading(false);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="migration-container">
      <button
        className="migration-button"
        onClick={handleMigration}
        disabled={loading}
        title="Migration vocabulary cũ cho user hiện tại"
      >
        {loading ? "🔄 Đang migration..." : "📦 Migration Data"}
      </button>

      {message && (
        <div
          className={`migration-message ${
            message.includes("✅") ? "success" : "error"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default MigrationButton;
