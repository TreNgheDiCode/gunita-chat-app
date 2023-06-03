'use client'

import { SiZalo } from 'react-icons/si';
import { BsLinkedin, BsDiscord, BsFacebook, BsGoogle, BsGithub } from 'react-icons/bs';

import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/Input";
import { useCallback, useEffect, useState } from "react";
import { 
    SubmitHandler, 
    FieldValues, 
    useForm 
} from "react-hook-form";
import AuthSocialButton from "./AuthSocialButton";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Variant = 'LOGIN' | 'REGISTER';

const AuthForm = () => {
    const session = useSession();
    const router = useRouter();
    const [variant, setVariant] = useState<Variant>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (session?.status == 'authenticated') {
            router.push('/users')
        }
    }, [session?.status, router])

    const toggleVariant = useCallback(() => {
        if (variant == 'LOGIN') {
            setVariant('REGISTER');
        } else {
            setVariant('LOGIN');
        }
    }, [variant]);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    });

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);

        if (variant == 'REGISTER') {
            axios.post('/api/register', data)
            .then(() => {
                toast.success('Đăng ký thành công');
                signIn('credentials', data);
            })
            .catch(() => toast.error('Vui lòng nhập đầy đủ thông tin'))
            .finally(() => setIsLoading(false));
        }

        if (variant == 'LOGIN') {
            signIn('credentials', {
                ...data,
                redirect: false
            })
            .then((callback) => {
                if (callback?.error) {
                    toast.error("Sai thông tin tài khoản");
                }

                if (callback?.ok && !callback?.error) {
                    toast.success("Đăng nhập thành công");
                    router.push('/users')
                }
            })
            .finally(() => setIsLoading(false));
        }
    }

    const socialAction = (action:string) => {
        setIsLoading(true);

        signIn(action, { redirect: false })
        .then((callback) => {
            if (callback?.error) {
                toast.error("Sai thông tin tài khoản");
            }

            if (callback?.ok && !callback?.error) {
                toast.success("Đăng nhập thành công");
            }
        })
        .finally(() => setIsLoading(false));
    }

    return ( 
        <div
            className="
                mt-8
                sm:mx-auto
                sm:w-full
                sm:max-w-md
            "
        >
            <div
                className="
                    bg-white
                    px-4
                    py-8
                    shadow
                    sm:rounded-lg
                    sm:px-10
                "
            >
                <form 
                    className="space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {variant == 'REGISTER' && (
                        <Input 
                            id='name' 
                            label="Tên của bạn" 
                            register={register}
                            errors={errors}
                            disabled={isLoading}
                        />
                    )}
                    <Input 
                        id='email' 
                        label="Địa chỉ Email" 
                        type="email"
                        register={register}
                        errors={errors}
                        disabled={isLoading}
                    />
                    <Input 
                        id='password' 
                        label="Mật khẩu"
                        type="password"
                        register={register}
                        errors={errors}
                        disabled={isLoading}
                    />
                    <div>
                        <Button
                            disabled={isLoading}
                            fullWidth
                            type="submit"
                        >
                            {variant == 'LOGIN' ? 'Đăng nhập' : 'Đăng ký'}
                        </Button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div
                            className="
                                absolute
                                inset-0
                                flex
                                items-center
                            "
                        >
                            <div 
                                className="
                                    w-full 
                                    border-t 
                                    border-gray-300
                                "
                            />
                        </div>
                        <div className="
                            relative 
                            flex 
                            justify-center 
                            text-sm"
                        >
                            <span className="
                                bg-white 
                                px-2 
                                text-gray-500"
                            >
                                Hoặc tiếp tục với
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <AuthSocialButton 
                            icon={BsGithub}
                            onClick={() => socialAction('github')}
                        />

                        <AuthSocialButton 
                            icon={BsGoogle}
                            onClick={() => socialAction('google')}
                        />

                        <AuthSocialButton 
                            icon={BsFacebook}
                            onClick={() => socialAction('facebook')}
                        />
                    </div>
                    
                    <div className="mt-6 flex gap-2">
                        <AuthSocialButton 
                            icon={BsDiscord}
                            onClick={() => socialAction('discord')}
                        />

                        <AuthSocialButton 
                            icon={BsLinkedin}
                            onClick={() => socialAction('linkedin')}
                        />

                        <AuthSocialButton 
                            icon={SiZalo}
                            onClick={() => socialAction('zalo')}
                        />
                    </div>
                </div>

                <div className='
                    flex
                    gap-2
                    justify-center
                    text-sm
                    mt-6
                    px-2
                    text-gray-500
                '>
                    <div>
                        {variant == 'LOGIN' ? 'Bạn chưa có tài khoản?' : 'Đã có tài khoản?'}
                    </div>
                    <div
                        onClick={toggleVariant}
                        className='
                            underline
                            cursor-pointer
                        '
                    >
                        {variant == 'LOGIN' ? 'Đăng ký tài khoản' : "Đăng nhập ngay"}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthForm;