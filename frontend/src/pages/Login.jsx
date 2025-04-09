import React, { useState, useEffect } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { authAPI } from '../services/api'
import { toast } from 'react-hot-toast'

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const navigate = useNavigate()

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            navigate('/')
        }
    }, [navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
        }
        if (!formData.password) {
            newErrors.password = 'Password is required'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        try {
            const response = await authAPI.login(formData)
            if (response.data && response.data.status === 'success' && response.data.data && response.data.data.token) {
                // Store token in localStorage
                localStorage.setItem('token', response.data.data.token)
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(response.data.data.user))
                toast.success('Successfully logged in!')
                navigate('/')
            } else {
                toast.error('Login failed: No token received')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.'
            setErrors({
                submit: errorMessage
            })
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

  return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-sm w-full">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                Admin
                            </h2>
                            <p className="text-sm text-gray-600">
                                Sign in to your account
                            </p>
                        </div>

                        {errors.submit && (
                            <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-2">
                                        <h3 className="text-xs font-medium text-red-800">
                                            {errors.submit}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className={`appearance-none block w-full px-3 py-2 border ${
                                        errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none text-sm`}
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="text-xs">
                                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                            Forgot?
                                        </a>
                                    </div>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className={`appearance-none block w-full px-3 py-2 border ${
                                        errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none text-sm`}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                        loading
                                            ? 'bg-indigo-400 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                    }`}
                                >
                                    {loading ? (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : null}
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Login