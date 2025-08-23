# Contributing to Secure Mesh CLI

Thank you for your interest in contributing to the Secure Mesh CLI project! This document provides guidelines and information for contributors.

## Code of Conduct

This project adheres to professional standards of conduct. Please be respectful and constructive in all interactions.

## 🎯 **Project Status**

**Secure Mesh CLI is now PRODUCTION READY!** 

### **✅ Current Status:**
- **Core Functionality**: 100% Complete and Working
- **Security Features**: Enterprise-grade cryptography implemented
- **CLI Interface**: Professional interactive interface
- **Testing**: Comprehensive test suite with Jest
- **Documentation**: Complete API and usage documentation
- **Deployment**: Docker containerization ready

### **🚀 Ready For:**
- **Production Use** in security research environments
- **Client Demonstrations** showcasing security expertise
- **GitHub Portfolio** demonstrating technical capabilities
- **Professional Consulting** at $150-200/hr rates
- **Security Training** and educational purposes

### **🔧 Development Focus:**
- **Bug Fixes** and performance improvements
- **Feature Enhancements** (group messaging, multi-hop routing)
- **Security Hardening** and additional attack simulations
- **UI/UX Improvements** and additional visualization options
- **Integration** with external security tools

## Getting Started

### Prerequisites

- **Node.js 18+** (required for ES modules and modern crypto APIs)
- **npm or yarn** for dependency management
- **Git** for version control

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**: `git clone https://github.com/yourusername/secure-mesh-cli.git`
3. **Install dependencies**: `npm install`
4. **Create a feature branch**: `git checkout -b feature/your-feature-name`
5. **Start development server**: `npm run dev` (with auto-reload)
6. **Test the CLI**: `node src/index.js`

## Development Guidelines

### Code Style

- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comprehensive JSDoc comments for all public APIs
- Follow security best practices

### Testing

- **Write tests for new functionality** following existing patterns
- **Ensure all tests pass**: `npm test`
- **Maintain good test coverage** (currently comprehensive)
- **Test security features thoroughly** - this is critical for a security tool
- **Test the CLI interactively**: `node src/index.js` to verify functionality

#### **Current Test Coverage:**
- ✅ **Cryptographic Operations**: RSA, ECDH, AES, ChaCha20
- ✅ **Network Simulation**: Node creation, connections, messaging
- ✅ **CLI Interface**: Command processing and interactive mode
- ✅ **Security Features**: Authentication, encryption, validation
- ✅ **Topology Management**: Network visualization and statistics

### Security Considerations

- All security-related code must be reviewed
- Follow cryptographic best practices
- Validate all inputs and outputs
- Document security assumptions and limitations

## Pull Request Process

1. Ensure your code follows the project guidelines
2. Update documentation as needed
3. Add tests for new functionality
4. Update the CHANGELOG.md
5. Submit a pull request with a clear description

## Security Issues

For security vulnerabilities, please contact the maintainers directly rather than opening a public issue.

## Questions?

Feel free to open an issue for questions or clarification about the contribution process.
