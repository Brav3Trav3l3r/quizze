import { useCallback, useContext, useEffect, useState } from 'react';
import formatDate from '../../../utils/formatDate';
import styles from './styles/index.module.css';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../../../components/ui/Modal';
import { Button } from '../../../components/ui';
import useModal from '../../../hooks/useModal';
import toast from 'react-hot-toast';
import QuizCreator from '../QuizCreator';
import { AuthContext } from '../../../store/authContext';
import copyLink from '../../../utils/copyLink';

export default function Analytics() {
  const [quizzes, setQuizzes] = useState([]);

  const { isOpen: delteIsOpen, toggleModal: toggleDeletModal } = useModal();
  const [isDeleting, setIsDeleting] = useState(false);

  const { isOpen: editIsOpen, toggleModal: toggleEditModal } = useModal();

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const fetchQuizes = useCallback(async () => {
    if (!user) {
      throw new Error('Access token not found');
    }

    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + 'users/pollsAndQuizzes',
        {
          headers: { Authorization: 'Bearer ' + user },
        }
      );

      if (!res.ok) {
        throw new Error("Could't fetch data");
      }

      const resData = await res.json();
      return resData;
    } catch (error) {
      console.error(error);
    }
  }, [user]);

  useEffect(() => {
    fetchQuizes().then((data) => setQuizzes(data.data.docs));
  }, [fetchQuizes]);

  const [quizToDelete, setQuizToDelete] = useState(null);
  const handleDelete = (quiz) => {
    toggleDeletModal();
    setQuizToDelete(quiz);
  };

  const confirmDelete = async () => {
    const category = quizToDelete.category === 'quiz' ? 'quizzes/' : 'polls/';

    if (!user) {
      throw new Error('Access token not found');
    }

    setIsDeleting(true);

    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + category + quizToDelete._id,
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer ' + user,
          },
        }
      );

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Something went wrong');
      }

      toast.success('Successfully deleted');
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    } finally {
      setQuizToDelete(null);
      setIsDeleting(false);
      toggleDeletModal();
      navigate(0);
    }
  };

  const [quizToUpdate, setQuizToUpdate] = useState(null);

  const handleUpdate = (el) => {
    setQuizToUpdate(el);
    toggleEditModal();
  };

  return (
    <div>
      <h1>Quiz Analysis</h1>

      <table className={styles.table}>
        <tr>
          <th>S.No</th>
          <th>Quiz name</th>
          <th>Created on</th>
          <th>Impression</th>
          <th></th>
          <th></th>
        </tr>

        {quizzes?.map((el, index) => (
          <tr key={el._id}>
            <td>{index + 1}</td>
            <td>{el.name}</td>
            <td>{formatDate(el.createdAt)}</td>
            <td>{el.impressions}</td>
            <td className={styles.icons}>
              <Icon
                onClick={() => handleUpdate(el)}
                icon="mingcute:edit-line"
              />
              <Icon
                onClick={() => handleDelete(el)}
                icon="mingcute:delete-2-line"
              />
              <Icon
                onClick={() => copyLink(el._id, el.category)}
                icon="mingcute:share-2-line"
              />
            </td>
            <td>
              <Link to={`/${el.category}/${el._id}`}>
                Question with analysis
              </Link>
            </td>
          </tr>
        ))}
      </table>

      {delteIsOpen && (
        <Modal toggleModal={toggleDeletModal}>
          <div className={styles.modalContent}>
            <h2>Are you confirm you want to delete?</h2>
            <div className={styles.actions}>
              <Button variant="error" onClick={confirmDelete}>
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
              <Button onClick={toggleDeletModal}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}

      {editIsOpen && (
        <Modal toggleModal={toggleEditModal}>
          <QuizCreator
            editIsOpen={editIsOpen}
            quizType={quizToUpdate.category}
            defaultData={quizToUpdate}
            actions="update"
            toggleEditModal={toggleEditModal}
          />
        </Modal>
      )}
    </div>
  );
}
