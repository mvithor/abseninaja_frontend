import PageContainer from 'src/components/container/PageContainer';
import HeroBlog from './blog/HeroBlog';
import UtamaBlog from './blog/UtamaBlog';
import DaftarBlog from './blog/DaftarBlog';
import CtaBlog from './blog/CtaBlog';
import { META } from '../data/blog';

// Blog `/blog` (daftar artikel): hanya menyusun seksi. Teks dan artikel di
// data/blog.js, logika murni di lib/blog.js, tampilan di pages/blog/. Halaman ini
// hanya terdaftar bila gerbang rilis alat menyala (lib/gerbang.js, routes.jsx).
export default function Blog() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroBlog />
      <UtamaBlog />
      <DaftarBlog />
      <CtaBlog />
    </PageContainer>
  );
}
