import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "/logo.svg";

function TermsAndPolicyPage() {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo section */}
        <div className="flex justify-center mb-6">
          <motion.img
            src={Logo}
            alt="Logo"
            className="h-16"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
        </div>

        {/* Heading section */}
        <motion.h1
          className="text-3xl font-bold mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Terms and Privacy Policy
        </motion.h1>

        {/* Section 1: Terms of Service */}
        <motion.section
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-2">Terms of Service</h2>
          <p className="text-gray-700">
            Your terms of service content goes here. You can describe how users
            are allowed to use your services, disclaimers, limitations of
            liability, etc.
          </p>
        </motion.section>

        {/* Section 2: Privacy Policy */}
        <motion.section
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-2">Privacy Policy</h2>
          <p className="text-gray-700">
            Your privacy policy content goes here. Explain how you handle user
            data, what information you collect, and how it’s used or stored.
          </p>
        </motion.section>

        {/* Section 3: Data Collection */}
        <motion.section
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-2">Data Collection</h2>
          <p className="text-gray-700">
            Details about data collection and usage. You should include how you
            collect, store, and protect data, as well as user rights.
          </p>
        </motion.section>

        {/* Section 4: User Rights */}
        <motion.section
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-2">User Rights</h2>
          <p className="text-gray-700">
            Explain the rights users have over their data, including access,
            correction, and deletion.
          </p>
        </motion.section>

        {/* Section 5: Contact Information */}
        <motion.section
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
          <p className="text-gray-700">
            Provide information on how users can contact you regarding your
            policies.
          </p>
        </motion.section>

        {/* Back to Login Button */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="text-sm text-blue-500 hover:underline">
              Back to Login Page
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default TermsAndPolicyPage;
