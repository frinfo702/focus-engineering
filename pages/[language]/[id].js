import { useRouter } from 'next/router';

export default function LanguageIdPage() {
  const router = useRouter();
  const { language, id } = router.query;
  
  // 適切なページにリダイレクト
  useEffect(() => {
    if (language && id) {
      router.replace(`/problems/${language}/${id}`);
    }
  }, [language, id, router]);
  
  return <div>リダイレクト中...</div>;
}
